const router = require("express").Router(),
  common = require("./common");

const pool = require("mariadb").createPool({
  host: process.env.DB_Host,
  user: process.env.DB_User,
  password: process.env.DB_Pass,
  database: process.env.DB_Db,
  useSSL: false,
  allowPublicKeyRetrieval: true
});

async function topdata(ponude, conn) {
  for (let i = 0; i < ponude.length; i++) {
    ponude[i].u_id = (await conn.query("SELECT u_id FROM prostorulice WHERE p_id = " + ponude[i].id + " LIMIT 1"))[0].u_id;

    ponude[i].u_id = (await conn.query("SELECT ime FROM ulice WHERE id = " + ponude[i].u_id))[0].ime;

    let temp = (await conn.query("SELECT slika FROM slike WHERE p_id = " + ponude[i].id + " LIMIT 1"))[0];

    if (temp) ponude[i].slika = ponude[i].id + "/" + temp.slika;
    if (ponude[i].broj_soba === 5.5) ponude[i].broj_soba = "drugo";
  }

  return ponude;
}

router.get("/", async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();

    let data = await common.indexdata(conn);
    data.ponude = await topdata(await conn.query("SELECT id FROM top_ponude"), conn);
    data.reklame = await conn.query("SELECT slika, poruka, link FROM reklame");

    res.render("index", data);
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) await conn.release();
  }
});

router.get("/pretraga", async (req, res) => {
  let conn;

  if (!req.query.n_id || !req.query.u_id0 || !req.query.broj_soba || !req.query.izdavanje) {
    res.end();
    return;
  }

  try {
    conn = await pool.getConnection();

    let sql = `
    FROM prostori
    WHERE n_id = ?
    AND broj_soba = ?
    AND ? IN (SELECT u_id FROM prostorulice WHERE p_id = prostori.id)
    AND izdavanje = ?`;

    if (req.query.broj_soba === "drugo") req.query.broj_soba = 5.5;
    let arr = [req.query.n_id, req.query.broj_soba, req.query.u_id0, req.query.izdavanje];

    if (req.query.cena) {
      sql += " AND cena <= ?";
      arr.push(req.query.cena);
    }
    if (req.query.kvadrati) {
      sql += " AND kvadrati >= ?";
      arr.push(req.query.kvadrati);
    }

    let data = await common.indexdata(conn);
    data.l = (await conn.query("SELECT CEIL(COUNT(*) / 9) AS l" + sql, arr))[0].l;
    sql = "SELECT id, n_id, cena, stara_cena, spratnost, kvadrati, broj_soba, lokacija, currency" + sql;
    data.ponude = await topdata(await conn.query(sql, arr), conn);

    res.locals.title = "ARNO Nekretnine: Rezultati Pretrage";
    res.render("search_results", data);
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) await conn.release();
  }
});

router.get("/all", async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();

    let data = await common.indexdata(conn);
    let sql = "SELECT * FROM top_ponude LIMIT 9";
    data.l = (await conn.query("SELECT CEIL(COUNT(*) / 9) AS l FROM top_ponude"))[0].l;
    const temp = Math.abs(req.query.page);
    if (temp && req.query.page && temp <= data.l) sql += " OFFSET " + 9 * (temp - 1);

    data.ponude = await topdata(await conn.query(sql), conn, 0);
    data.top = 1;

    res.locals.title = "ARNO Nekretnine: Top Ponude";
    res.render("search_results", data);
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) await conn.release();
  }
});

/*
router.get("/filter", async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();

    const temp = req.query.u_id.split(" ");
    let sql = "";
    let data = [];
    for (const i of temp) {
      sql += `SELECT id, n_id, cena, stara_cena, spratnost, kvadrati, broj_soba, lokacija, currency
      FROM prostori
      WHERE n_id = ?
      AND broj_soba = ?
      AND ? IN (SELECT u_id FROM prostorulice WHERE p_id = prostori.id)
      AND cena BETWEEN ? AND ?
      AND spratnost BETWEEN ? AND ?
      AND kvadrati BETWEEN ? AND ?`;

      data.push(
        req.query.n_id,
        req.query.broj_soba,
        i,
        req.query.cena_min,
        req.query.cena_max,
        req.query.spratnost_min,
        req.query.spratnost_max,
        req.query.kvadrati_min,
        req.query.kvadrati_max
      );

      if (temp.indexOf(i) < temp.length - 1)
        sql += " UNION ";
    }

    res.locals.title = "ARNO Nekretnine: Rezultati Pretrage";
    res.render("search_results", data);
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) await conn.release();
  }
});
*/

router.route("/oglas/:id")
  .route("/oglas/:id")
  .get(async (req, res) => {
    let conn;

    try {
      conn = await pool.getConnection();

      let sql = `SELECT id, n_id, cena, stara_cena, kvadrati, broj_soba, spratnost, karakteristike, opis, currency, lokacija
      FROM prostori
      WHERE id = ?`;
      sql = await conn.query(sql, req.params.id);

      if (!sql[0]) {
        res.end();
        return;
      }

      sql = (await common.estatedata(sql, conn))[0];

      res.locals.title = "ARNO Nekretnine: " + sql.u_id[0];
      res.render("oglas", { ponuda: sql });
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

      await conn.query("INSERT INTO poruke (p_id, poruka) VALUES (?, ?)", [req.params.id, req.body.poruka]);
    } catch (err) {
      console.log(err);
    } finally {
      if (conn) await conn.release();
    }
  });

module.exports = router;
