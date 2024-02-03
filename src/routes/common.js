async function estatedata(ponude, conn) {
  for (let i = 0; i < ponude.length; i++) {
    ponude[i].u_id = await conn.query("SELECT u_id FROM prostorulice WHERE p_id = " + ponude[i].id);

    ponude[i].karakteristike = JSON.parse(ponude[i].karakteristike);

    ponude[i].n_id = (await conn.query("SELECT ime FROM nekretnine WHERE id = " + ponude[i].n_id))[0].ime;

    for (let j = 0; j < ponude[i].u_id.length; j++) {
      ponude[i].u_id[j] = ponude[i].u_id[j].u_id;
      ponude[i].u_id[j] = (await conn.query("SELECT ime FROM ulice WHERE id = " + ponude[i].u_id[j]))[0].ime;
    }

    ponude[i].slike = [];
    const temp = await conn.query("SELECT slika FROM slike WHERE p_id = " + ponude[i].id);
    for (const j of temp)
      ponude[i].slike.push(ponude[i].id + "/" + j.slika);

    if (ponude[i].broj_soba === 5.5)
      ponude[i].broj_soba = "drugo";
  }

  return ponude;
}

async function indexdata(conn, limited = 1) {
  const vrste = await conn.query("SELECT * FROM vrste");
  let nekretnine = [];
  for (const vrsta of vrste) {
    let sql = "SELECT id, ime FROM nekretnine WHERE v_id = " + vrsta.id;
    if (limited)
      sql += " AND EXISTS (SELECT 1 FROM prostori WHERE n_id = nekretnine.id)";
    nekretnine.push(await conn.query(sql));
  }

  const lokacije = await conn.query("SELECT * FROM lokacije");
  let ulice = [];
  for (const lokacija of lokacije) {
    let sql = "SELECT id, ime FROM ulice WHERE l_id = " + lokacija.id;
    if (limited)
      sql += " AND EXISTS (SELECT 1 FROM prostorulice WHERE u_id = ulice.id)";
    ulice.push(await conn.query(sql));
  }

  let brsoba = [];
  for (let i = 0.5; i < 5.5; i = i + 0.5) {
    const temp = (await conn.query("SELECT EXISTS (SELECT 1 FROM prostori WHERE broj_soba = " + i + ") AS l"))[0].l;
    if (temp || !limited)
      brsoba.push(i);
  }
  brsoba.push("drugo");

  return {
    vrste: vrste,
    nekretnine: nekretnine,
    lokacije: lokacije,
    ulice: ulice,
    brsoba: brsoba
  };
}

const pool = require("mariadb").createPool({
  host: process.env.DB_Host,
  user: process.env.DB_User,
  password: process.env.DB_Pass,
  database: process.env.DB_Db,
  port: process.env.Db_port,
  useSSL: false,
  allowPublicKeyRetrieval: true
});

module.exports = {
  estatedata,
  indexdata,
  pool
};
