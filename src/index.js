// @flow
// Pustaka Kalender Jawa
// Perhtungan, pengkonversian dan penanggalan Jawa
// 📁 index.js
// :ES6

// $FlowFixMe
import 'core-js/stable'
// $FlowFixMe
import 'regenerator-runtime/runtime'
import * as Kurup from './kurup_asapon_anenhing_statik.js'
import type { RumusSasiTaunType, TaunKurupType } from './type.js'
import { konversiHari, konversiPasaran, cariWulanRegistry, cariTaunRegistry, cariRumusWulanTaun } from './silpin.js'

/**
   * Mencari Kurup dan Taun Jawa
   * @param { number } input - 4 digit integer
   * @returns { Promise } data - hasil promise adalah object
   */

async function cariKurupTaun (_q: number): Promise<TaunKurupType> {
  return new Promise((resolve, reject) => {
    for (const _kurup of Kurup.KURUP_ASAPON_ANENHING) {
      _kurup.awal.find(query => {
        if (query === _q) resolve(_kurup)
      })
    }

    reject(new Error('Error cariKurupTaun'))
  })
}

/**
 * Fungsi untuk mencari rumus perhitungan abadi
 * @param {string} wulan
 * @param {number} taun
 */
async function cariRumusAbadiAwalBulanTahunJawa (wulan: string, taun: number): Promise<?RumusSasiTaunType> {
  return new Promise((resolve, reject) => {
    cariKurupTaun(taun).then(r => {
      const wulanMap = cariWulanRegistry(wulan)
      const taunMap = cariTaunRegistry(r.taun.taun)

      // koreksi jumlah hari bulan dulkijah
      // berdasarkan tahun jawa
      if (wulanMap !== undefined || wulanMap !== undefined) {
        if (r.taun.cacah === 354) {
          const _correction = { cacah: [29] }
          if (wulanMap.urutan === 12) {
            Object.assign(wulanMap, _correction)
          }
        } else {
          const _correction = { cacah: [30] }
          if (wulanMap.urutan === 12) {
            Object.assign(wulanMap, _correction)
          }
        }
      }

      if (wulanMap !== undefined && taunMap !== undefined) {
        const KEY_RUMUS = `${wulanMap.celukan}_${taunMap.taun}`
        const RWT = cariRumusWulanTaun(KEY_RUMUS, { wulan: wulan, taun: taun })
        if (RWT !== undefined) {
          resolve(RWT)
        }
      }
      reject(new Error('error cariRumusAbadi'))
    }).catch(e => reject(e))
  })
}

/**
 *
 * @param {string} w - string wulan (bulan)
 * @param {number} t - 4 digit integer
 */
async function cariHariPasaranAwalBulanTahunJawa (w: string, t: number) {
  // $FlowFixMe
  const [sengkalaTaun, sengkalaRumus] = await Promise.all([cariKurupTaun(t), cariRumusAbadiAwalBulanTahunJawa(w, t)])
  const [kH, kP] = await Promise.all([konversiHari(sengkalaRumus.rumus.dino, sengkalaTaun.kurup.dinten.urutan), konversiPasaran(sengkalaRumus.rumus.pasaran, sengkalaTaun.kurup.pasaran.urutan)])

  const i = { taun: sengkalaTaun.taun.taun, kurup: `${sengkalaTaun.kurup.taun} ${sengkalaTaun.kurup.dinten.dino} ${sengkalaTaun.kurup.pasaran.pasaran}` }
  return { w, t, i, kH, kP }
}

async function sasi (s: string, th: number) {
  const { kH, kP } = await cariHariPasaranAwalBulanTahunJawa(s, th)
  const dat = await cariRumusAbadiAwalBulanTahunJawa(s, th)
  const _m = []
  let i = 0
  do {
    i = i + 1
    _m.push({ [i]: { dino: koreksiDino(kH.urutan++), pasaran: koreksiPasaran(kP.urutan++) } })
  } while (i < dat.wulan.cacah[0])
  console.log(_m)

  // pasaran 5
  // hari 7
  // sasi 29/30
  // taun : 1953,
  // 1. Cari hari dan pasaran awal bulan
  // 2. Hitung dan simpan semua tanggal, hari & pasaran ke dalam Array

  // sasi : [
  //  { mukarom: [ {tanggal:1, pasaran: 'pahing', dinten: 'senen'}, {tanggal: 2, pasaran: 'pon', dinten: 'selasa'} ] },
  //  { sapar: [ {...} ] }
}

function koreksiDino (d: number): number {
  let dc = 0
  if (d > 7) {
    dc = d % 7
    if (dc === 0) {
      dc = 7
    }
  } else {
    dc = d
  }
  return dc
}

function koreksiPasaran (p: number): number {
  let pc = 0
  if (p > 5) {
    pc = p % 5
    if (pc === 0) {
      pc = 5
    }
  } else {
    pc = p
  }
  return pc
}

function version (): string {
  return '1.0.0-alpha © Lawang Tunggal Walang Kembar (2019), Junwatu'
}

export {
  cariKurupTaun as cariKurupTahunJawa,
  cariRumusAbadiAwalBulanTahunJawa,
  cariHariPasaranAwalBulanTahunJawa,
  sasi,
  version
}
