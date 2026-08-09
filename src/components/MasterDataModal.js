"use client";

import { useEffect, useMemo, useState } from "react";

import {
  X,
  User,
  MapPin,
  Building2,
  Wallet,
  CreditCard,
  Save,
  ChevronDown,
  Info,
  Loader2,
} from "lucide-react";

import { API_URL } from "../lib/api";

import "../styles/components/master-data-modal.css";

/* =========================================================
   INITIAL FORM
========================================================= */

const INITIAL_FORM = {
  id_reg: "",
  nama: "",
  nik: "",
  alamat_lengkap: "",
  no_hp: "",

  lantai: "",
  blok: "",
  no: "",

  objek: {
    id: "",
    jenis: "",
    tipe: "",
    dimensi: "",
  },

  tarif: {
    sewa: {
      nominal: "",
      perhitungan: "",
    },

    keamanan: {
      id: "",
      nominal: "",
      perhitungan: "",
    },

    kebersihan: {
      id: "",
      nominal: "",
      perhitungan: "",
    },
  },

  /*
    Status pembayaran hanya informasi.
    Tidak dikirim sebagai bagian dari
    payload CREATE / UPDATE.
  */
  status_pembayaran: "",
};

/* =========================================================
   FORM MAPPER
========================================================= */

function createFormData(data) {
  if (!data) {
    return {
      id_reg: "",
      nama: "",
      nik: "",
      alamat_lengkap: "",
      no_hp: "",

      lantai: "",
      blok: "",
      no: "",

      objek: {
        id: "",
        jenis: "",
        tipe: "",
        dimensi: "",
      },

      tarif: {
        sewa: {
          nominal: "",
          perhitungan: "",
        },

        keamanan: {
          id: "",
          nominal: "",
          perhitungan: "",
        },

        kebersihan: {
          id: "",
          nominal: "",
          perhitungan: "",
        },
      },

      status_pembayaran: "",
    };
  }

  return {
    id_reg: data.id_reg ?? "",

    nama: data.nama ?? "",

    nik: data.nik ?? "",

    alamat_lengkap:
      data.alamat_lengkap ?? "",

    no_hp:
      data.no_hp ?? "",

    lantai:
      data.lantai ?? "",

    blok:
      data.blok ?? "",

    no:
      data.no ?? "",

    objek: {
      id:
        data.objek?.id ??
        data.id_jenis_objek ??
        "",

      jenis:
        data.objek?.jenis ?? "",

      tipe:
        data.objek?.tipe ?? "",

      dimensi:
        data.objek?.dimensi ?? "",
    },

    tarif: {
      sewa: {
        nominal:
          data.tarif?.sewa?.nominal ??
          "",

        perhitungan:
          data.tarif?.sewa?.perhitungan ??
          "",
      },

      keamanan: {
        id:
          data.id_tarif_keamanan ??
          data.tarif?.keamanan?.id ??
          "",

        nominal:
          data.tarif?.keamanan?.nominal ??
          "",

        perhitungan:
          data.tarif?.keamanan?.perhitungan ??
          "",
      },

      kebersihan: {
        id:
          data.id_tarif_kebersihan ??
          data.tarif?.kebersihan?.id ??
          "",

        nominal:
          data.tarif?.kebersihan?.nominal ??
          "",

        perhitungan:
          data.tarif?.kebersihan?.perhitungan ??
          "",
      },
    },

    /*
      Hanya untuk display.
    Tidak masuk payload CRUD.
    */

    status_pembayaran:
      data.status_pembayaran ?? "",
  };
}

/* =========================================================
   HELPERS
========================================================= */

function formatRupiah(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Rp 0";
  }

  const number =
    Number(value);

  if (
    Number.isNaN(number)
  ) {
    return "Rp 0";
  }

  return `Rp ${number.toLocaleString(
    "id-ID"
  )}`;
}

function getStatusClass(status) {
  const normalized =
    String(status || "")
      .toLowerCase()
      .trim();

  if (
    normalized.includes(
      "sudah bayar"
    )
  ) {
    return "status-sudah-bayar";
  }

  if (
    normalized.includes(
      "belum bayar"
    )
  ) {
    return "status-belum-bayar";
  }

  if (
    normalized.includes(
      "tunggakan"
    ) ||
    normalized.includes(
      "menunggak"
    )
  ) {
    return "status-menunggak";
  }

  return "status-default";
}

/* =========================================================
   COMPONENT
========================================================= */

export default function MasterDataModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave,
}) {

  /* =======================================================
     STATE
  ======================================================= */

  const [formData, setFormData] =
    useState(
      createFormData(null)
    );

  const [
    jenisObjekData,
    setJenisObjekData,
  ] = useState([]);

  const [
    tarifData,
    setTarifData,
  ] = useState([]);

  const [
    loadingMaster,
    setLoadingMaster,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /*
    Mode hanya boleh:
    - create
    - edit

    Jika mode tidak diberikan,
    default dianggap create.
  */

  const isEdit =
    mode === "edit";

  const isCreate =
    !isEdit;

  /* =====================================================
     LOAD MASTER DATA
  ===================================================== */

  useEffect(() => {

    if (!isOpen) {
      return;
    }

    async function loadMasterData() {

      try {

        setLoadingMaster(true);

        setErrorMessage("");

        const [
          jenisResponse,
          tarifResponse,
        ] = await Promise.all([

          fetch(
            `${API_URL}?path=jenisObjek`
          ),

          fetch(
            `${API_URL}?path=tarif`
          ),

        ]);

        if (
          !jenisResponse.ok ||
          !tarifResponse.ok
        ) {

          throw new Error(
            "Gagal mengambil master data."
          );

        }

        const jenisJson =
          await jenisResponse.json();

        const tarifJson =
          await tarifResponse.json();

        if (
          !jenisJson.success ||
          !tarifJson.success
        ) {

          throw new Error(
            "Data master tidak berhasil dimuat."
          );

        }

        setJenisObjekData(
          Array.isArray(
            jenisJson.data
          )
            ? jenisJson.data
            : []
        );

        setTarifData(
          Array.isArray(
            tarifJson.data
          )
            ? tarifJson.data
            : []
        );

      } catch (error) {

        console.error(
          "Master data modal:",
          error
        );

        setErrorMessage(
          "Gagal memuat data master."
        );

      } finally {

        setLoadingMaster(
          false
        );

      }

    }

    loadMasterData();

  }, [isOpen]);

  /* =====================================================
     INITIAL FORM
  ===================================================== */

  useEffect(() => {

    if (!isOpen) {
      return;
    }

    /*
      CREATE:
      selalu gunakan form kosong.

      EDIT:
      gunakan data yang dipilih parent.
    */

    setFormData(
      createFormData(
        isEdit
          ? initialData
          : null
      )
    );

    setErrorMessage("");

  }, [
    isOpen,
    mode,
    initialData,
    isEdit,
  ]);

  /* =====================================================
     SELECTED JENIS OBJEK
  ===================================================== */

  const selectedJenisObjek =
    useMemo(() => {

      return jenisObjekData.find(
        (item) =>
          String(
            item.id_jenis_objek ??
            ""
          ) ===
          String(
            formData.objek.id ??
            ""
          )
      );

    }, [
      jenisObjekData,
      formData.objek.id,
    ]);

  /* =====================================================
     AUTO UPDATE DETAIL OBJEK
     + TARIF SEWA
  ===================================================== */

  useEffect(() => {

    if (
      !selectedJenisObjek
    ) {
      return;
    }

    const idTarifSewa =
      selectedJenisObjek.id_tarif;

    const tarifSewa =
      tarifData.find(
        (item) =>
          String(
            item.id_tarif ??
            ""
          ) ===
          String(
            idTarifSewa ??
            ""
          )
      );

    setFormData(
      (prev) => ({

        ...prev,

        objek: {

          ...prev.objek,

          jenis:
            selectedJenisObjek
              .jenis_objek ??
            "",

          tipe:
            selectedJenisObjek.TIPE ??
            selectedJenisObjek.tipe ??
            "",

          dimensi:
            selectedJenisObjek.dimensi ??
            "",

        },

        tarif: {

          ...prev.tarif,

          sewa: {

            nominal:
              tarifSewa?.tarif ??
              "",

            perhitungan:
              tarifSewa?.perhitungan ??
              "",

          },

        },

      })
    );

  }, [
    selectedJenisObjek,
    tarifData,
  ]);

  /* =====================================================
     TARIF OPTIONS
  ===================================================== */

  const tarifOptions =
    useMemo(() => {

      return tarifData.filter(
        (item) => {

          const id =
            item.id_tarif;

          return (
            id !== undefined &&
            id !== null &&
            String(id).trim() !== ""
          );

        }
      );

    }, [tarifData]);

  /* =====================================================
     BASIC CHANGE
  ===================================================== */

  function handleChange(e) {

    const {
      name,
      value,
    } = e.target;

    setFormData(
      (prev) => ({

        ...prev,

        [name]:
          value,

      })
    );

  }

  /* =====================================================
     JENIS OBJEK CHANGE
  ===================================================== */

  function handleJenisObjekChange(
    e
  ) {

    const id =
      e.target.value;

    const selected =
      jenisObjekData.find(
        (item) =>
          String(
            item.id_jenis_objek ??
            ""
          ) ===
          String(id)
      );

    if (!selected) {

      setFormData(
        (prev) => ({

          ...prev,

          objek: {

            id: "",
            jenis: "",
            tipe: "",
            dimensi: "",

          },

          tarif: {

            ...prev.tarif,

            sewa: {

              nominal: "",
              perhitungan: "",

            },

          },

        })
      );

      return;
    }

    const tarifSewa =
      tarifData.find(
        (item) =>
          String(
            item.id_tarif ??
            ""
          ) ===
          String(
            selected.id_tarif ??
            ""
          )
      );

    setFormData(
      (prev) => ({

        ...prev,

        objek: {

          id:
            selected.id_jenis_objek ??
            "",

          jenis:
            selected.jenis_objek ??
            "",

          tipe:
            selected.TIPE ??
            selected.tipe ??
            "",

          dimensi:
            selected.dimensi ??
            "",

        },

        tarif: {

          ...prev.tarif,

          sewa: {

            nominal:
              tarifSewa?.tarif ??
              "",

            perhitungan:
              tarifSewa?.perhitungan ??
              "",

          },

        },

      })
    );

  }

  /* =====================================================
     TARIF TAMBAHAN CHANGE
  ===================================================== */

  function handleTarifChange(
    field,
    value
  ) {

    const selected =
      tarifData.find(
        (item) =>
          String(
            item.id_tarif ??
            ""
          ) ===
          String(value)
      );

    setFormData(
      (prev) => ({

        ...prev,

        tarif: {

          ...prev.tarif,

          [field]: {

            id:
              value,

            nominal:
              selected?.tarif ??
              "",

            perhitungan:
              selected?.perhitungan ??
              "",

          },

        },

      })
    );

  }

  /* =====================================================
     BUILD CRUD PAYLOAD
     
     Payload ini sengaja dibuat
     kompatibel dengan:
     
     apiCreateMasterData()
     apiUpdateMasterData()
     
     melalui getMasterDataPayload()
  ===================================================== */

  function buildCrudPayload() {

    const payload = {

      /*
        ID hanya dikirim saat EDIT.

        Saat CREATE:
        endpoint akan generate
        id_reg sendiri.
      */

      ...(isEdit
        ? {
            id_reg:
              String(
                formData.id_reg ??
                ""
              ).trim(),
          }
        : {}),

      nama:
        String(
          formData.nama ??
          ""
        ).trim(),

      nik:
        String(
          formData.nik ??
          ""
        ).trim(),

      alamat_lengkap:
        String(
          formData.alamat_lengkap ??
          ""
        ).trim(),

      no_hp:
        String(
          formData.no_hp ??
          ""
        ).trim(),

      lantai:
        String(
          formData.lantai ??
          ""
        ).trim(),

      blok:
        String(
          formData.blok ??
          ""
        ).trim(),

      no:
        String(
          formData.no ??
          ""
        ).trim(),

      /*
        Struktur nested.
      */

      objek: {

        id:
          String(
            formData.objek?.id ??
            ""
          ).trim(),

      },

      tarif: {

        keamanan: {

          id:
            String(
              formData.tarif
                ?.keamanan
                ?.id ??
              ""
            ).trim(),

        },

        kebersihan: {

          id:
            String(
              formData.tarif
                ?.kebersihan
                ?.id ??
              ""
            ).trim(),

        },

      },

      /*
        Field eksplisit.
        Ini membuat payload juga
        aman jika parent/API
        menggunakan parameter flat.
      */

      id_jenis_objek:
        String(
          formData.objek?.id ??
          ""
        ).trim(),

      id_tarif_keamanan:
        String(
          formData.tarif
            ?.keamanan
            ?.id ??
          ""
        ).trim(),

      id_tarif_kebersihan:
        String(
          formData.tarif
            ?.kebersihan
            ?.id ??
          ""
        ).trim(),

    };

    return payload;
  }

  /* =====================================================
     VALIDATE FORM
  ===================================================== */

  function validateForm() {

    /*
      CREATE:
      id_reg TIDAK divalidasi karena
      dibuat otomatis oleh server.
    */

    if (
      isEdit &&
      !String(
        formData.id_reg ??
        ""
      ).trim()
    ) {

      return "ID Registrasi tidak ditemukan.";

    }

    if (
      !String(
        formData.nama ??
        ""
      ).trim()
    ) {

      return "Nama penyewa wajib diisi.";

    }

    if (
      !String(
        formData.objek?.id ??
        ""
      ).trim()
    ) {

      return "Jenis objek wajib dipilih.";

    }

    if (
      !String(
        formData.tarif
          ?.keamanan
          ?.id ??
        ""
      ).trim()
    ) {

      return "Tarif keamanan wajib dipilih.";

    }

    if (
      !String(
        formData.tarif
          ?.kebersihan
          ?.id ??
        ""
      ).trim()
    ) {

      return "Tarif kebersihan wajib dipilih.";

    }

    return "";

  }

  /* =====================================================
     SUBMIT
  ===================================================== */

  async function handleSubmit(
    e
  ) {

    e.preventDefault();

    setErrorMessage("");

    const validation =
      validateForm();

    if (validation) {

      setErrorMessage(
        validation
      );

      return;

    }

    try {

      setSaving(true);

      const payload =
        buildCrudPayload();

      /*
        Modal tidak menentukan URL
        endpoint secara langsung.

        Modal hanya memberi tahu parent:

        mode:
          "create"
          atau
          "update"

        data:
          payload CRUD

        Dengan demikian parent
        nantinya dapat menentukan
        endpoint yang digunakan.
      */

      if (
        typeof onSave !==
        "function"
      ) {

        throw new Error(
          "Handler penyimpanan tidak tersedia."
        );

      }

      await onSave({

        mode:
          isEdit
            ? "update"
            : "create",

        data:
          payload,

      });

    } catch (error) {

      console.error(
        "Gagal menyimpan master data:",
        error
      );

      setErrorMessage(
        error?.message ||
        "Data gagal disimpan."
      );

    } finally {

      setSaving(false);

    }

  }

  /* =====================================================
     RENDER
  ===================================================== */

  if (!isOpen) {
    return null;
  }

  const status =
    formData.status_pembayaran;

  return (
    <div
      className="md-modal-overlay"
      onMouseDown={(e) => {

        if (
          e.target ===
            e.currentTarget &&
          !saving
        ) {

          onClose();

        }

      }}
    >

      <div
        className="md-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="md-modal-title"
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="md-modal-header">

          <div className="md-modal-heading">

            <div className="md-modal-icon">
              <Building2 size={19} />
            </div>

            <div>

              <h3 id="md-modal-title">

                {isEdit
                  ? "Edit Master Data"
                  : "Tambah Master Data"}

              </h3>

              <p>

                {isEdit
                  ? "Perbarui informasi penyewa, lokasi, objek, dan tarif."
                  : "Tambahkan data penyewa, lokasi, objek, dan tarif baru."}

              </p>

            </div>

          </div>

          <button
            type="button"
            className="md-modal-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Tutup"
          >
            <X size={19} />
          </button>

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="md-modal-form"
          onSubmit={handleSubmit}
        >

          <div className="md-modal-body">

            {errorMessage && (

              <div className="md-form-alert">

                <Info size={16} />

                <span>
                  {errorMessage}
                </span>

              </div>

            )}

            {/* =================================================
                IDENTITAS
            ================================================= */}

            <section className="md-form-section">

              <div className="md-section-heading">

                <div className="md-section-icon">
                  <User size={17} />
                </div>

                <div>

                  <h4>
                    Identitas Penyewa
                  </h4>

                  <p>
                    Informasi dasar penyewa atau pemilik objek.
                  </p>

                </div>

              </div>

              <div className="md-form-grid md-grid-2">

                <div className="md-form-group">

                  <label htmlFor="id_reg">

                    ID Registrasi

                    {isEdit && (
                      <span>*</span>
                    )}

                  </label>

                  <input
                    id="id_reg"
                    name="id_reg"
                    value={
                      isCreate
                        ? ""
                        : formData.id_reg
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={
                      isCreate
                        ? "Dibuat otomatis oleh sistem"
                        : "ID Registrasi"
                    }
                    disabled={
                      isEdit ||
                      saving
                    }
                    readOnly={
                      isCreate
                    }
                  />

                  <small className="md-field-hint">

                    {isCreate
                      ? "ID Registrasi akan dibuat otomatis dengan format PSA-MMYYNNNN."
                      : "ID registrasi merupakan identitas utama dan tidak dapat diubah."}

                  </small>

                </div>

                <div className="md-form-group">

                  <label htmlFor="nama">

                    Nama
                    <span>*</span>

                  </label>

                  <input
                    id="nama"
                    name="nama"
                    value={
                      formData.nama
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Nama penyewa"
                    disabled={saving}
                  />

                </div>

                <div className="md-form-group">

                  <label htmlFor="nik">
                    NIK
                  </label>

                  <input
                    id="nik"
                    name="nik"
                    value={
                      formData.nik
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Nomor NIK"
                    inputMode="numeric"
                    disabled={saving}
                  />

                </div>

                <div className="md-form-group">

                  <label htmlFor="no_hp">
                    No. HP
                  </label>

                  <input
                    id="no_hp"
                    name="no_hp"
                    value={
                      formData.no_hp
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="08xxxxxxxxxx"
                    inputMode="tel"
                    disabled={saving}
                  />

                </div>

                <div className="md-form-group md-span-2">

                  <label htmlFor="alamat_lengkap">

                    Alamat Lengkap

                  </label>

                  <textarea
                    id="alamat_lengkap"
                    name="alamat_lengkap"
                    value={
                      formData.alamat_lengkap
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Masukkan alamat lengkap penyewa"
                    rows={3}
                    disabled={saving}
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                LOKASI
            ================================================= */}

            <section className="md-form-section">

              <div className="md-section-heading">

                <div className="md-section-icon">
                  <MapPin size={17} />
                </div>

                <div>

                  <h4>
                    Lokasi Objek
                  </h4>

                  <p>
                    Tentukan posisi objek pada area pasar.
                  </p>

                </div>

              </div>

              <div className="md-form-grid md-grid-3">

                <div className="md-form-group">

                  <label htmlFor="lantai">
                    Lantai
                  </label>

                  <input
                    id="lantai"
                    name="lantai"
                    value={
                      formData.lantai
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Contoh: 1"
                    disabled={saving}
                  />

                </div>

                <div className="md-form-group">

                  <label htmlFor="blok">
                    Blok
                  </label>

                  <input
                    id="blok"
                    name="blok"
                    value={
                      formData.blok
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Contoh: A"
                    disabled={saving}
                  />

                </div>

                <div className="md-form-group">

                  <label htmlFor="no">
                    Nomor
                  </label>

                  <input
                    id="no"
                    name="no"
                    value={
                      formData.no
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Nomor objek"
                    disabled={saving}
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                OBJEK
            ================================================= */}

            <section className="md-form-section">

              <div className="md-section-heading">

                <div className="md-section-icon">
                  <Building2 size={17} />
                </div>

                <div>

                  <h4>
                    Informasi Objek
                  </h4>

                  <p>
                    Pilih jenis objek. Detail objek dan tarif sewa akan mengikuti master.
                  </p>

                </div>

              </div>

              <div className="md-form-grid md-grid-2">

                <div className="md-form-group md-span-2">

                  <label htmlFor="jenis_objek">

                    Jenis Objek
                    <span>*</span>

                  </label>

                  <div className="md-select-wrapper">

                    <select
                      id="jenis_objek"
                      value={
                        formData.objek.id
                      }
                      onChange={
                        handleJenisObjekChange
                      }
                      disabled={
                        loadingMaster ||
                        saving
                      }
                    >

                      <option value="">

                        {loadingMaster
                          ? "Memuat jenis objek..."
                          : "Pilih jenis objek"}

                      </option>

                      {jenisObjekData.map(
                        (item) => (

                          <option
                            key={
                              item.id_jenis_objek
                            }
                            value={
                              item.id_jenis_objek
                            }
                          >

                            {
                              item.jenis_objek
                            }

                            {item.TIPE
                              ? ` — ${item.TIPE}`
                              : item.tipe
                              ? ` — ${item.tipe}`
                              : ""}

                            {item.dimensi
                              ? ` (${item.dimensi})`
                              : ""}

                          </option>

                        )
                      )}

                    </select>

                    <ChevronDown
                      size={16}
                    />

                  </div>

                </div>

                <div className="md-form-group">

                  <label>
                    Tipe
                  </label>

                  <input
                    value={
                      formData.objek.tipe
                    }
                    readOnly
                    placeholder="Otomatis dari master objek"
                  />

                </div>

                <div className="md-form-group">

                  <label>
                    Dimensi
                  </label>

                  <input
                    value={
                      formData.objek.dimensi
                    }
                    readOnly
                    placeholder="Otomatis dari master objek"
                  />

                </div>

              </div>

              <div className="md-readonly-note">

                <Info size={15} />

                <span>

                  Tipe, dimensi, dan tarif sewa
                  mengikuti konfigurasi
                  <strong>
                    {" "}tbl_jenis_objek
                  </strong>
                  {" "}dan tidak diedit langsung dari data penyewa.

                </span>

              </div>

            </section>

            {/* =================================================
                TARIF
            ================================================= */}

            <section className="md-form-section">

              <div className="md-section-heading">

                <div className="md-section-icon">
                  <Wallet size={17} />
                </div>

                <div>

                  <h4>
                    Informasi Tarif
                  </h4>

                  <p>
                    Tarif sewa mengikuti jenis objek, sedangkan tarif tambahan dapat dipilih.
                  </p>

                </div>

              </div>

              <div className="md-tarif-grid">

                {/* =================================================
                    SEWA
                ================================================= */}

                <div className="md-tarif-card md-tarif-readonly">

                  <div className="md-tarif-top">

                    <div>

                      <span>
                        Tarif Sewa
                      </span>

                      <small>
                        Mengikuti objek
                      </small>

                    </div>

                    <Wallet size={16} />

                  </div>

                  <strong>

                    {formatRupiah(
                      formData.tarif
                        .sewa
                        .nominal
                    )}

                  </strong>

                  <small>

                    {formData.tarif
                      .sewa
                      .perhitungan ||
                      "Belum ditentukan"}

                  </small>

                </div>

                {/* =================================================
                    KEAMANAN
                ================================================= */}

                <div className="md-tarif-card">

                  <div className="md-tarif-top">

                    <div>

                      <span>
                        Keamanan
                      </span>

                      <small>
                        Pilih tarif
                      </small>

                    </div>

                    <Wallet size={16} />

                  </div>

                  <div className="md-tarif-select">

                    <select
                      value={
                        formData.tarif
                          .keamanan
                          .id
                      }
                      onChange={(e) =>
                        handleTarifChange(
                          "keamanan",
                          e.target.value
                        )
                      }
                      disabled={
                        loadingMaster ||
                        saving
                      }
                    >

                      <option value="">
                        Pilih tarif
                      </option>

                      {tarifOptions.map(
                        (item) => (

                          <option
                            key={
                              item.id_tarif
                            }
                            value={
                              item.id_tarif
                            }
                          >

                            {formatRupiah(
                              item.tarif
                            )}

                            {" — "}

                            {item.perhitungan ||
                              "Tetap"}

                          </option>

                        )
                      )}

                    </select>

                    <ChevronDown
                      size={15}
                    />

                  </div>

                  <strong>

                    {formatRupiah(
                      formData.tarif
                        .keamanan
                        .nominal
                    )}

                  </strong>

                </div>

                {/* =================================================
                    KEBERSIHAN
                ================================================= */}

                <div className="md-tarif-card">

                  <div className="md-tarif-top">

                    <div>

                      <span>
                        Kebersihan
                      </span>

                      <small>
                        Pilih tarif
                      </small>

                    </div>

                    <Wallet size={16} />

                  </div>

                  <div className="md-tarif-select">

                    <select
                      value={
                        formData.tarif
                          .kebersihan
                          .id
                      }
                      onChange={(e) =>
                        handleTarifChange(
                          "kebersihan",
                          e.target.value
                        )
                      }
                      disabled={
                        loadingMaster ||
                        saving
                      }
                    >

                      <option value="">
                        Pilih tarif
                      </option>

                      {tarifOptions.map(
                        (item) => (

                          <option
                            key={
                              item.id_tarif
                            }
                            value={
                              item.id_tarif
                            }
                          >

                            {formatRupiah(
                              item.tarif
                            )}

                            {" — "}

                            {item.perhitungan ||
                              "Tetap"}

                          </option>

                        )
                      )}

                    </select>

                    <ChevronDown
                      size={15}
                    />

                  </div>

                  <strong>

                    {formatRupiah(
                      formData.tarif
                        .kebersihan
                        .nominal
                    )}

                  </strong>

                </div>

              </div>

            </section>

            {/* =================================================
                STATUS
            ================================================= */}

            <section className="md-form-section md-status-section">

              <div className="md-section-heading">

                <div className="md-section-icon">
                  <CreditCard size={17} />
                </div>

                <div>

                  <h4>
                    Status Pembayaran
                  </h4>

                  <p>
                    Status dihitung otomatis dari transaksi pembayaran periode berjalan.
                  </p>

                </div>

              </div>

              <div className="md-status-card">

                <div className="md-status-info">

                  <span>
                    Status saat ini
                  </span>

                  <strong>

                    {status ||
                      "Belum ada data"}

                  </strong>

                </div>

                <span
                  className={`md-status-badge ${getStatusClass(
                    status
                  )}`}
                >

                  {status ||
                    "Belum ada data"}

                </span>

              </div>

              <div className="md-readonly-note">

                <Info size={15} />

                <span>

                  Status pembayaran hanya
                  informasi. Nilainya tidak
                  disimpan melalui form ini.

                </span>

              </div>

            </section>

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="md-modal-footer">

            <div className="md-footer-info">

              {loadingMaster ? (

                <>

                  <Loader2
                    size={14}
                    className="icon-spin"
                  />

                  Memuat master data...

                </>

              ) : (

                <>

                  <Info size={14} />

                  {isCreate
                    ? "ID registrasi akan dibuat otomatis saat data disimpan."
                    : "Perubahan akan dicatat ke log master data."}

                </>

              )}

            </div>

            <div className="md-footer-actions">

              <button
                type="button"
                className="btn-modal-cancel"
                onClick={onClose}
                disabled={saving}
              >
                Batal
              </button>

              <button
                type="submit"
                className="btn-modal-save"
                disabled={
                  saving ||
                  loadingMaster
                }
              >

                {saving ? (

                  <Loader2
                    size={16}
                    className="icon-spin"
                  />

                ) : (

                  <Save size={16} />

                )}

                {saving
                  ? isCreate
                    ? "Menyimpan..."
                    : "Memperbarui..."
                  : isCreate
                  ? "Simpan Data"
                  : "Simpan Perubahan"}

              </button>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
}