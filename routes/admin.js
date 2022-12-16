const router = require("express").Router(),
  common = require("./common"),
  bcrypt = require("bcryptjs");

const pool = require("mariadb").createPool({
  //connectionLimit: 5,
  host: process.env.DB_Host,
  user: process.env.DB_User,
  password: process.env.DB_Pass,
  database: process.env.DB_Db,
  useSSL: false,
  allowPublicKeyRetrieval: true
});

async function admindata(conn, id) {
  let data = await common.indexdata(conn, 0);
  data.reklame = await conn.query("SELECT slika, poruka, link FROM reklame");
  data.poruke = await conn.query("SELECT * FROM poruke");

  if (id) {
    let sql = "SELECT id, n_id, cena, izdavanje, kvadrati, broj_soba, karakteristike FROM prostori WHERE ";

    if (id === "drugo") id = 5.5;
    if (Number(id)) sql += "prostori.id = ? OR broj_soba = ?";
    else {
      id = id.toLowerCase();
      sql += `? = (SELECT LOWER(ime) FROM nekretnine WHERE id = prostori.n_id)
      OR ? IN (SELECT LOWER(ime) FROM ulice INNER JOIN prostorulice ON ulice.id = prostorulice.u_id WHERE p_id = prostori.id)`;
    }

    id = Array(2).fill(id);
    data.ponude = await common.estatedata(await conn.query(sql, id), conn);
  }

  return data;
}

const hash = bcrypt.hashSync(process.env.Site_Pass);

router.use((req, res, next) => {
  res.locals.robots = "noindex";
  next();
});

router.route("/login")
  .get((req, res) => {
    res.render("admin_login");
  })
  .post((req, res) => {
    if (bcrypt.compareSync(req.body.password, hash)) res.cookie("nekretnine_admin", hash, { maxAge: 172800000, signed: true });
    res.redirect("/admin");
  });

router.use((req, res, next) => {
  if (req.signedCookies.nekretnine_admin !== hash) {
    res.redirect("/admin/login");
    return;
  }

  res.locals.css = "admin";
  next();
});

router.get("/", async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();

    let data = await admindata(conn, req.query.search);
    if (data.ponude) {
      for (let i = 0; i < data.ponude.length; i++) {
        data.ponude[i].n_id2 = (await conn.query("SELECT id FROM nekretnine WHERE ime = '" + data.ponude[i].n_id + "'"))[0].id;
        data.ponude[i].u_id2 = [];
        for (const u_id of data.ponude[i].u_id)
          data.ponude[i].u_id2.push((await conn.query("SELECT id FROM ulice WHERE ime = '" + u_id + "'"))[0].id);
      }
    }

    res.render("admin", data);
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) await conn.release();
  }
});

router.route("/dodajstan")
  .get(async (req, res) => {
    let conn;

    try {
      conn = await pool.getConnection();

      let data = await common.indexdata(conn, 0);
      if (req.query.id) data.ponuda = (await common.estatedata(await conn.query("SELECT * FROM prostori WHERE id = ?", req.query.id), conn))[0];

      res.render("admin_dodajstan", data);
    } catch (err) {
      console.log(err);
    } finally {
      if (conn) await conn.release();
    }
  })
  .post(async (req, res) => {
    let conn;

    try {
      conn = await pool.getConnection();
      await conn.query("START TRANSACTION");

      let id;
      if (!(id = req.body.id)) id = (await conn.query("SELECT IFNULL(MAX(id), 1) AS max FROM prostori"))[0].max + 1;

      let sql = "REPLACE INTO prostori (id, n_id, izdavanje, broj_soba";
      let sql2 = ") VALUES (" + id + ", ?, ?, ?";
      if (!Number(req.body.broj_soba)) req.body.broj_soba = 5.5;
      let data = [req.body.n_id, req.body.izdavanje, req.body.broj_soba];

      for (const i of ["cena", "stara_cena", "kvadrati", "spratnost", "karakteristike", "opis", "lokacija", "currency", "top"])
        if (req.body[i]) {
          sql += ", " + i;
          sql2 += ", ?";
          data.push(req.body[i]);
        }

      sql2 += ")";
      await conn.query(sql + sql2, data);

      sql = "DELETE FROM prostorulice WHERE p_id = ?";
      await conn.query(sql, id);

      sql = "INSERT INTO prostorulice (p_id, u_id) VALUES ";
      sql2 = 0;
      data = [];
      while (req.body["u_id" + sql2]) {
        sql += "(?, ?)";
        data.push(id, req.body["u_id" + sql2++]);
        if (req.body["u_id" + sql2]) sql += ",";
      }
      await conn.query(sql, data);

      sql = "REPLACE INTO slike (id, p_id, slika) VALUES ";
      sql2 = 0;
      const max = (await conn.query("SELECT IFNULL(MAX(id), 1) AS max FROM slike"))[0].max + 1;
      let del = "0";
      data = [];
      let temp = await conn.query("SELECT id, slika FROM slike WHERE p_id = ?", id);
      while (temp[sql2] || (req.files && req.files["slika" + sql2])) {
        sql += "(";
        if (temp[sql2]) {
          del += "," + temp[sql2].id;
          sql += temp[sql2].id;
        } else {
          del += "," + max;
          sql += max++;
        }
        sql += ", ?, ?)";

        let temp2;
        if (req.files && req.files["slika" + sql2]) {
          temp2 = req.files["slika" + sql2].name;
          req.files["slika" + sql2].mv("public" + "/images/oglasi/" + id + "/" + temp2);
        } else temp2 = temp[sql2].slika;
        sql2++;

        data.push(id, temp2);
        if (req.files && req.files["slika" + sql2]) sql += ",";
      }

      if (sql2) {
        await conn.query(sql, data);
        sql = "DELETE FROM slike WHERE p_id = ? AND id NOT IN (" + del + ")";
        await conn.query(sql, id);
      }

      if (req.body.karakteristika0) {
        sql = "UPDATE prostori SET karakteristike = ? WHERE id = ?";
        sql2 = 0;
        data = {};
        while (req.body["karakteristika" + sql2]) data[req.body["karakteristika" + sql2]] = req.body["vrednost" + sql2++];
        await conn.query(sql, [JSON.stringify(data), id]);
      }

      await conn.query("COMMIT");
      res.redirect("/admin");
    } catch (err) {
      if (conn) await conn.query("ROLLBACK");
      console.log(err);
    } finally {
      if (conn) await conn.release();
    }
  });

router.post("/deleteestate/:id", async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();

    await conn.query("DELETE FROM prostori WHERE id = ?", req.params.id);
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) await conn.release();
  }
});

router.post("/deletemessage/:id", async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();

    await conn.query("DELETE FROM poruke WHERE id = ?", req.params.id);
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) await conn.release();
  }
});

router.post("/replace_reklame", async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.query("START TRANSACTION");

    let data = [];
    let num = (await conn.query("SELECT IFNULL(MIN(id), 1) AS min FROM reklame"))[0].min;
    const l = num + Object.keys(req.body).length / 2;
    for (; num < l; num++) {
      let sql = "REPLACE INTO reklame (id, poruka";
      let sql2 = ") VALUES (" + num + ", ?";
      let data = [req.body["poruka" + num]];

      let temp = (await conn.query("SELECT slika FROM reklame WHERE id = " + num))[0];
      if (temp || (req.files && req.files["slika" + num])) {
        sql += ", slika";
        sql2 += ", ?";
        if (req.files && req.files["slika" + num]) {
          temp = req.files["slika" + num].name;
          req.files["slika" + num].mv("public" + "/images/oglasi/" + temp);
        } else temp = temp.slika;
        data.push(temp);
      }

      if (req.body["link" + num]) {
        sql += ", link";
        sql2 += ", ?";
        data.push(req.body["link" + num]);
      }

      sql2 += ")";
      await conn.query(sql + sql2, data);
    }

    await conn.query("DELETE FROM reklame WHERE id >= " + num);
    await conn.query("COMMIT");
    res.redirect("/admin");
  } catch (err) {
    if (conn) await conn.query("ROLLBACK");
    console.log(err);
  } finally {
    if (conn) await conn.release();
  }
});

router.post("/replace/:table", async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.query("START TRANSACTION");

    let t = "lokacije";
    let t2 = "ulice";
    let i = "l_id";
    if (req.params.table === "vrste") {
      t = "vrste";
      t2 = "nekretnine";
      i = "v_id";
    }

    let sql = "REPLACE INTO " + t + " (id, ime) VALUES ";
    let sql2 = "REPLACE INTO " + t2 + " (id, " + i + ", ime) VALUES ";
    i = (await conn.query("SELECT IFNULL(MIN(id), 1) AS min FROM " + t))[0].min;
    let j = (await conn.query("SELECT IFNULL(MIN(id), 1) AS min FROM " + t2))[0].min;
    let data = [];
    let data2 = [];
    for (const key of Object.keys(req.body)) {
      req.body[key] = req.body[key].split("\r\n");
      for (let ulica = 0; ulica < req.body[key].length; ulica++) {
        sql2 += "(?, ?, ?)";
        data2.push(j, i, req.body[key][ulica]);
        if (ulica < Object.keys(req.body[key]).length - 1) sql2 += ", ";
        j++;
      }

      sql += "(?, ?)";
      data.push(i, key);
      if (Object.keys(req.body).indexOf(key) < Object.keys(req.body).length - 1) {
        sql += ", ";
        sql2 += ", ";
      }
      i++;
    }

    await conn.query(sql, data);
    await conn.query(sql2, data2);
    await conn.query("DELETE FROM " + t2 + " WHERE id >= " + j);
    await conn.query("DELETE FROM " + t + " WHERE id >= " + i);
    await conn.query("COMMIT");

    res.redirect("/admin");
  } catch (err) {
    if (conn) await conn.query("ROLLBACK");
    console.log(err);
  } finally {
    if (conn) await conn.release();
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("arno-nekretnine-admin");
  res.redirect("/");
});

module.exports = router;
