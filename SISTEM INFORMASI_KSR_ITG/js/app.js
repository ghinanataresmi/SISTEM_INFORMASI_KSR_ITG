
/* =====================================================
   SISTEM INFORMASI ORGANISASI KSR ITG
   JAVASCRIPT UTAMA
===================================================== */

/* =====================================================
   1. KONFIGURASI DAN PENYIMPANAN
===================================================== */

const STORAGE = {
    anggota: "ksr_anggota",
    program: "ksr_program",
    anggaran: "ksr_anggaran",
    remember: "ksr_remember"
};

function ambilData(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function simpanData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function buatId() {
    return Date.now().toString(36) +
        Math.random().toString(36).substring(2, 8);
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(angka) || 0);
}

function formatTanggal(tanggal) {
    if (!tanggal) return "-";

    const [tahun, bulan, hari] = tanggal.split("-");
    return new Date(
        Number(tahun),
        Number(bulan) - 1,
        Number(hari)
    ).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function statusClass(status) {
    const value = String(status).toLowerCase();

    if (value === "aktif" || value === "selesai") {
        return "status-aktif";
    }

    if (value === "nonaktif") {
        return "status-nonaktif";
    }

    return "";
}

/* =====================================================
   2. LOGIN DAN LOGOUT
===================================================== */

const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

function masukDashboard() {
    loginPage.classList.add("hidden");
    dashboardPage.classList.remove("hidden");

    tampilkanSemuaData();
}

function keluarDashboard() {
    dashboardPage.classList.add("hidden");
    loginPage.classList.remove("hidden");

    document.getElementById("password").value = "";
    document.getElementById("loginMessage").textContent = "";

    localStorage.removeItem(STORAGE.remember);
}

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const remember = document.getElementById("rememberMe").checked;

    // AKUN DEMO
    if (username === "admin" && password === "ksritg123") {

        if (remember) {
            localStorage.setItem(STORAGE.remember, "true");
        } else {
            localStorage.removeItem(STORAGE.remember);
        }

        masukDashboard();

    } else {
        loginMessage.textContent =
            "Username atau password yang Anda masukkan salah.";
    }
});

document.getElementById("logoutButton")
    .addEventListener("click", keluarDashboard);

document.getElementById("togglePassword")
    .addEventListener("click", function () {

        const password = document.getElementById("password");
        const icon = this.querySelector("i");

        password.type =
            password.type === "password" ? "text" : "password";

        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
    });

// Remember Me
if (localStorage.getItem(STORAGE.remember) === "true") {
    masukDashboard();
}

/* =====================================================
   3. NAVIGASI DASHBOARD
===================================================== */

const menuLinks = document.querySelectorAll(".menu-link");
const sections = document.querySelectorAll(".page-section");

function bukaHalaman(nama) {

    const target = document.getElementById("page-" + nama);

    if (!target) return;

    sections.forEach(section => {
        section.classList.remove("active");
    });

    target.classList.add("active");

    menuLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.page === nama
        );
    });

    const judul = document.getElementById("pageTitle");

    const namaHalaman = {
        dashboard: "Dashboard",
        anggota: "Data Anggota",
        program: "Program Kerja",
        anggaran: "Pengelolaan Anggaran",
        arsip: "Arsip Dokumentasi",
        laporan: "Laporan Organisasi",
        organisasi: "Informasi Organisasi"
    };

    judul.textContent = namaHalaman[nama] || "Dashboard";

    if (nama === "arsip") {
        tampilkanArsip();
    }

    if (nama === "laporan") {
        tampilkanLaporan();
    }

    if (nama === "dashboard") {
        tampilkanDashboard();
    }

    document.getElementById("sidebar").classList.remove("show");
}

menuLinks.forEach(link => {
    link.addEventListener("click", function (event) {
        event.preventDefault();
        bukaHalaman(this.dataset.page);
    });
});

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", function () {
        bukaHalaman(this.dataset.go);
    });
});

document.getElementById("menuToggle")
    .addEventListener("click", function () {
        document.getElementById("sidebar")
            .classList.toggle("show");
    });

/* =====================================================
   4. DATA ANGGOTA
===================================================== */

const formAnggota = document.getElementById("formAnggota");

function resetFormAnggota() {
    formAnggota.reset();

    document.getElementById("editAnggotaId").value = "";

    document.getElementById("formAnggotaTitle").textContent =
        "Tambah Anggota";

    document.getElementById("batalEditAnggota")
        .classList.add("hidden");
}

formAnggota.addEventListener("submit", function (event) {
    event.preventDefault();

    const id = document.getElementById("editAnggotaId").value;

    const anggota = {
        id: id || buatId(),

        nama: document.getElementById("namaAnggota").value.trim(),

        nim: document.getElementById("nimAnggota").value.trim(),

        departemen:
            document.getElementById("departemenAnggota").value,

        jabatan:
            document.getElementById("jabatanAnggota").value.trim(),

        hp: document.getElementById("hpAnggota").value.trim(),

        status:
            document.getElementById("statusAnggota").value
    };

    if (!anggota.nama || !anggota.nim || !anggota.departemen) {
        alert("Lengkapi data anggota terlebih dahulu.");
        return;
    }

    const data = ambilData(STORAGE.anggota);

    const nimDuplikat = data.some(item =>
        item.nim === anggota.nim && item.id !== id
    );

    if (nimDuplikat) {
        alert("NIM sudah terdaftar.");
        return;
    }

    if (id) {
        const index = data.findIndex(item => item.id === id);

        if (index !== -1) {
            data[index] = anggota;
        }
    } else {
        data.push(anggota);
    }

    simpanData(STORAGE.anggota, data);

    resetFormAnggota();
    tampilkanAnggota();
    tampilkanDashboard();

    alert(id ? "Data anggota berhasil diperbarui."
        : "Anggota berhasil ditambahkan.");
});

function tampilkanAnggota() {

    const data = ambilData(STORAGE.anggota);

    const tbody = document.getElementById("tabelAnggota");

    const kata = document.getElementById("cariAnggota")
        .value.toLowerCase();

    const hasil = data.filter(item =>
        (item.nama + " " + item.nim + " " + item.departemen)
            .toLowerCase().includes(kata)
    );

    if (!hasil.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-message">
                    Belum ada data anggota.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = hasil.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${escapeHTML(item.nama)}</td>
            <td>${escapeHTML(item.nim)}</td>
            <td>${escapeHTML(item.departemen)}</td>
            <td>${escapeHTML(item.jabatan || "-")}</td>
            <td>${escapeHTML(item.hp || "-")}</td>
            <td>
                <span class="status-badge ${statusClass(item.status)}">
                    ${escapeHTML(item.status)}
                </span>
            </td>
            <td>
                <div class="action-group">
                    <button class="btn-edit"
                            data-edit-anggota="${item.id}">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button class="btn-delete"
                            data-hapus-anggota="${item.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

// Pencarian anggota
document.getElementById("cariAnggota")
    .addEventListener("input", tampilkanAnggota);

// Edit dan hapus anggota
document.getElementById("tabelAnggota")
    .addEventListener("click", function (event) {

        const editButton =
            event.target.closest("[data-edit-anggota]");

        const deleteButton =
            event.target.closest("[data-hapus-anggota]");

        const data = ambilData(STORAGE.anggota);

        if (editButton) {

            const item = data.find(data =>
                data.id === editButton.dataset.editAnggota
            );

            if (!item) return;

            document.getElementById("editAnggotaId").value = item.id;
            document.getElementById("namaAnggota").value = item.nama;
            document.getElementById("nimAnggota").value = item.nim;

            document.getElementById("departemenAnggota").value =
                item.departemen;

            document.getElementById("jabatanAnggota").value =
                item.jabatan || "";

            document.getElementById("hpAnggota").value =
                item.hp || "";

            document.getElementById("statusAnggota").value =
                item.status;

            document.getElementById("formAnggotaTitle").textContent =
                "Edit Data Anggota";

            document.getElementById("batalEditAnggota")
                .classList.remove("hidden");

            window.scrollTo({ top: 0, behavior: "smooth" });
        }

        if (deleteButton) {

            if (!confirm("Hapus data anggota ini?")) return;

            const hasil = data.filter(item =>
                item.id !== deleteButton.dataset.hapusAnggota
            );

            simpanData(STORAGE.anggota, hasil);

            tampilkanAnggota();
            tampilkanDashboard();
        }
    });

document.getElementById("batalEditAnggota")
    .addEventListener("click", resetFormAnggota);

/* =====================================================
   5. PROGRAM KERJA
===================================================== */

const formProgram = document.getElementById("formProgram");

formProgram.addEventListener("submit", function (event) {
    event.preventDefault();

    const program = {
        id: buatId(),

        nama: document.getElementById("namaProgram").value.trim(),

        departemen:
            document.getElementById("departemenProgram").value,

        tanggal:
            document.getElementById("tanggalProgram").value,

        pj: document.getElementById("pjProgram").value.trim(),

        status:
            document.getElementById("statusProgram").value
    };

    if (!program.nama || !program.departemen ||
        !program.tanggal || !program.pj) {
        alert("Lengkapi data program kerja.");
        return;
    }

    const data = ambilData(STORAGE.program);

    data.push(program);

    simpanData(STORAGE.program, data);

    formProgram.reset();

    tampilkanProgram();
    tampilkanDashboard();

    alert("Program kerja berhasil disimpan.");
});

function tampilkanProgram() {

    const data = ambilData(STORAGE.program);

    const tbody = document.getElementById("tabelProgram");

    if (!data.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    Belum ada program kerja.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${escapeHTML(item.nama)}</td>
            <td>${escapeHTML(item.departemen)}</td>
            <td>${formatTanggal(item.tanggal)}</td>
            <td>${escapeHTML(item.pj)}</td>
            <td>
                <span class="status-badge ${statusClass(item.status)}">
                    ${escapeHTML(item.status)}
                </span>
            </td>
            <td>
                <button class="btn-delete"
                        data-hapus-program="${item.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

document.getElementById("tabelProgram")
    .addEventListener("click", function (event) {

        const button = event.target.closest("[data-hapus-program]");

        if (!button) return;

        if (!confirm("Hapus program kerja ini?")) return;

        const data = ambilData(STORAGE.program).filter(item =>
            item.id !== button.dataset.hapusProgram
        );

        simpanData(STORAGE.program, data);

        tampilkanProgram();
        tampilkanDashboard();
    });

/* =====================================================
   6. PENGELOLAAN ANGGARAN
===================================================== */

document.getElementById("formAnggaran")
    .addEventListener("submit", function (event) {

        event.preventDefault();

        const transaksi = {
            id: buatId(),

            keterangan:
                document.getElementById("keteranganAnggaran")
                    .value.trim(),

            jenis:
                document.getElementById("jenisAnggaran").value,

            nominal:
                Number(document.getElementById("nominalAnggaran").value),

            tanggal:
                document.getElementById("tanggalAnggaran").value
        };

        if (!transaksi.keterangan ||
            !transaksi.jenis ||
            !transaksi.nominal ||
            transaksi.nominal <= 0 ||
            !transaksi.tanggal) {
            alert("Lengkapi transaksi dengan benar.");
            return;
        }

        const data = ambilData(STORAGE.anggaran);

        data.push(transaksi);

        simpanData(STORAGE.anggaran, data);

        this.reset();

        tampilkanAnggaran();
        tampilkanDashboard();

        alert("Transaksi berhasil disimpan.");
    });

function hitungAnggaran() {

    const data = ambilData(STORAGE.anggaran);

    const pemasukan = data
        .filter(item => item.jenis === "Pemasukan")
        .reduce((total, item) => total + item.nominal, 0);

    const pengeluaran = data
        .filter(item => item.jenis === "Pengeluaran")
        .reduce((total, item) => total + item.nominal, 0);

    return {
        pemasukan,
        pengeluaran,
        saldo: pemasukan - pengeluaran
    };
}

function tampilkanAnggaran() {

    const data = ambilData(STORAGE.anggaran);

    const total = hitungAnggaran();

    document.getElementById("totalPemasukan").textContent =
        formatRupiah(total.pemasukan);

    document.getElementById("totalPengeluaran").textContent =
        formatRupiah(total.pengeluaran);

    document.getElementById("saldoAnggaran").textContent =
        formatRupiah(total.saldo);

    const tbody = document.getElementById("tabelAnggaran");

    if (!data.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    Belum ada transaksi.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${escapeHTML(item.keterangan)}</td>
            <td>${escapeHTML(item.jenis)}</td>
            <td>${formatRupiah(item.nominal)}</td>
            <td>${formatTanggal(item.tanggal)}</td>
            <td>
                <button class="btn-delete"
                        data-hapus-anggaran="${item.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

document.getElementById("tabelAnggaran")
    .addEventListener("click", function (event) {

        const button = event.target.closest("[data-hapus-anggaran]");

        if (!button) return;

        if (!confirm("Hapus transaksi ini?")) return;

        const data = ambilData(STORAGE.anggaran).filter(item =>
            item.id !== button.dataset.hapusAnggaran
        );

        simpanData(STORAGE.anggaran, data);

        tampilkanAnggaran();
        tampilkanDashboard();
    });

/* =====================================================
   7. DATABASE ARSIP DOKUMENTASI
   INDEXEDDB
===================================================== */

const DB_NAME = "KSR_ITG_Arsip";
const DB_VERSION = 1;
const STORE_NAME = "dokumentasi";

let dbArsip = null;
let arsipUrls = [];

function bukaDatabaseArsip() {

    return new Promise((resolve, reject) => {

        if (!window.indexedDB) {
            reject(new Error("IndexedDB tidak didukung browser."));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = function () {

            const database = request.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, {
                    keyPath: "id",
                    autoIncrement: true
                });
            }
        };

        request.onsuccess = function () {
            dbArsip = request.result;
            resolve(dbArsip);
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
}

function simpanArsipDatabase(data) {

    return new Promise((resolve, reject) => {

        const transaction = dbArsip.transaction(
            STORE_NAME, "readwrite"
        );

        const request = transaction
            .objectStore(STORE_NAME)
            .add(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function ambilSemuaArsip() {

    return new Promise((resolve, reject) => {

        const transaction = dbArsip.transaction(
            STORE_NAME, "readonly"
        );

        const request = transaction
            .objectStore(STORE_NAME)
            .getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function hapusArsipDatabase(id) {

    return new Promise((resolve, reject) => {

        const transaction = dbArsip.transaction(
            STORE_NAME, "readwrite"
        );

        const request = transaction
            .objectStore(STORE_NAME)
            .delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/* =====================================================
   8. TAMBAH ARSIP
===================================================== */

document.getElementById("formArsip")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        if (!dbArsip) {
            alert("Database arsip belum siap.");
            return;
        }

        const inputFile = document.getElementById("fileArsip");

        const files = Array.from(inputFile.files);

        if (!files.length) {
            alert("Pilih minimal satu file dokumentasi.");
            return;
        }

        // Batas perlindungan ukuran total per arsip: 100 MB
        const totalUkuran = files.reduce(
            (total, file) => total + file.size, 0
        );

        if (totalUkuran > 100 * 1024 * 1024) {
            alert("Total ukuran file maksimal 100 MB per arsip.");
            return;
        }

        const data = {
            nama: document.getElementById("namaArsip")
                .value.trim(),

            jenis: document.getElementById("jenisArsip")
                .value,

            departemen: document.getElementById("departemenArsip")
                .value,

            tanggal: document.getElementById("tanggalArsip")
                .value,

            pj: document.getElementById("pjArsip")
                .value.trim(),

            keterangan: document.getElementById("keteranganArsip")
                .value.trim(),

            files: files.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size,
                blob: file
            })),

            dibuat: new Date().toISOString()
        };

        if (!data.nama || !data.jenis ||
            !data.departemen || !data.tanggal || !data.pj) {
            alert("Lengkapi seluruh informasi arsip.");
            return;
        }

        const tombol = this.querySelector('button[type="submit"]');

        tombol.disabled = true;
        tombol.textContent = "Menyimpan...";

        try {

            await simpanArsipDatabase(data);

            this.reset();

            await tampilkanArsip();
            tampilkanDashboard();

            alert("Dokumentasi berhasil disimpan.");

        } catch (error) {

            console.error(error);

            alert(
                "Dokumentasi gagal disimpan. " +
                "Periksa kapasitas penyimpanan browser."
            );

        } finally {

            tombol.disabled = false;
            tombol.innerHTML =
                '<i class="fa-solid fa-folder-plus"></i> Simpan Dokumentasi';
        }
    });

/* =====================================================
   9. MENAMPILKAN ARSIP
===================================================== */

function formatUkuran(bytes) {

    if (bytes < 1024) {
        return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function bersihkanArsipURL() {

    arsipUrls.forEach(url => URL.revokeObjectURL(url));

    arsipUrls = [];
}

async function tampilkanArsip() {

    if (!dbArsip) return;

    try {

        const data = await ambilSemuaArsip();

        bersihkanArsipURL();

        const totalFile = data.reduce(
            (total, item) => total + item.files.length, 0
        );

        const totalProgram = data.filter(
            item => item.jenis === "Program Kerja"
        ).length;

        document.getElementById("totalArsip").textContent =
            data.length;

        document.getElementById("totalFile").textContent =
            totalFile;

        document.getElementById("totalProgramArsip").textContent =
            totalProgram;

        const filterTahun = document.getElementById("filterTahun");

        const tahunLama = filterTahun.value;

        const tahun = [...new Set(
            data.map(item => item.tanggal.substring(0, 4))
        )].sort((a, b) => b.localeCompare(a));

        filterTahun.innerHTML =
            '<option value="">Semua Tahun</option>' +
            tahun.map(t => `
                <option value="${escapeHTML(t)}">${escapeHTML(t)}</option>
            `).join("");

        if (tahun.includes(tahunLama)) {
            filterTahun.value = tahunLama;
        }

        const kata = document.getElementById("cariArsip")
            .value.toLowerCase();

        const jenis = document.getElementById("filterArsip").value;

        const tahunDipilih = filterTahun.value;

        const hasil = data.filter(item => {

            const teks = [
                item.nama,
                item.jenis,
                item.departemen,
                item.pj,
                item.keterangan
            ].join(" ").toLowerCase();

            return teks.includes(kata) &&
                (!jenis || item.jenis === jenis) &&
                (!tahunDipilih ||
                    item.tanggal.startsWith(tahunDipilih));
        });

        hasil.sort((a, b) =>
            b.tanggal.localeCompare(a.tanggal)
        );

        const daftar = document.getElementById("daftarArsip");

        if (!hasil.length) {

            daftar.innerHTML = `
                <p class="empty-message">
                    Tidak ada arsip dokumentasi yang ditemukan.
                </p>
            `;

            return;
        }

        daftar.innerHTML = hasil.map(item => {

            const daftarFile = item.files.map(file => {

                const url = URL.createObjectURL(file.blob);

                arsipUrls.push(url);

                return `
                    <div class="arsip-file">

                        <span>
                            <i class="fa-solid fa-paperclip"></i>
                            ${escapeHTML(file.name)}
                            (${formatUkuran(file.size)})
                        </span>

                        <a href="${url}"
                           download="${escapeHTML(file.name)}">
                            Unduh
                        </a>

                    </div>
                `;
            }).join("");

            return `
                <div class="arsip-item">

                    <span class="arsip-badge">
                        ${escapeHTML(item.jenis)}
                    </span>

                    <h4>${escapeHTML(item.nama)}</h4>

                    <p>
                        <i class="fa-solid fa-calendar"></i>
                        ${formatTanggal(item.tanggal)}
                    </p>

                    <p>
                        <i class="fa-solid fa-users"></i>
                        ${escapeHTML(item.departemen)}
                    </p>

                    <p>
                        <i class="fa-solid fa-user"></i>
                        ${escapeHTML(item.pj)}
                    </p>

                    <p>
                        <i class="fa-solid fa-align-left"></i>
                        ${escapeHTML(item.keterangan || "Tidak ada keterangan")}
                    </p>

                    <div class="arsip-file-list">

                        <strong>
                            Dokumentasi (${item.files.length} file)
                        </strong>

                        ${daftarFile}

                    </div>

                    <div class="arsip-actions">

                        <button class="btn-hapus-arsip"
                                data-hapus-arsip="${item.id}">
                            <i class="fa-solid fa-trash"></i>
                            Hapus Arsip
                        </button>

                    </div>

                </div>
            `;

        }).join("");

    } catch (error) {

        console.error(error);

        document.getElementById("daftarArsip").innerHTML = `
            <p class="empty-message">
                Gagal menampilkan arsip.
            </p>
        `;
    }
}

/* =====================================================
   10. PENCARIAN DAN FILTER ARSIP
===================================================== */

document.getElementById("cariArsip")
    .addEventListener("input", tampilkanArsip);

document.getElementById("filterArsip")
    .addEventListener("change", tampilkanArsip);

document.getElementById("filterTahun")
    .addEventListener("change", tampilkanArsip);

/* =====================================================
   11. HAPUS ARSIP
===================================================== */

document.getElementById("daftarArsip")
    .addEventListener("click", async function (event) {

        const button = event.target.closest("[data-hapus-arsip]");

        if (!button) return;

        const id = Number(button.dataset.hapusArsip);

        if (!confirm(
            "Yakin ingin menghapus arsip beserta seluruh file dokumentasinya?"
        )) {
            return;
        }

        try {

            await hapusArsipDatabase(id);

            await tampilkanArsip();

            tampilkanDashboard();

            alert("Arsip berhasil dihapus.");

        } catch (error) {

            console.error(error);

            alert("Gagal menghapus arsip.");
        }
    });

/* =====================================================
   12. DASHBOARD
===================================================== */

async function tampilkanDashboard() {

    const anggota = ambilData(STORAGE.anggota);
    const program = ambilData(STORAGE.program);
    const total = hitungAnggaran();

    document.getElementById("dashAnggota").textContent =
        anggota.length;

    document.getElementById("dashProgram").textContent =
        program.length;

    document.getElementById("dashPemasukan").textContent =
        formatRupiah(total.pemasukan);

    if (dbArsip) {

        try {

            const arsip = await ambilSemuaArsip();

            document.getElementById("dashArsip").textContent =
                arsip.length;

        } catch (error) {

            console.error(error);
        }
    }
}

/* =====================================================
   13. LAPORAN ORGANISASI
===================================================== */

async function tampilkanLaporan() {

    const anggota = ambilData(STORAGE.anggota);
    const program = ambilData(STORAGE.program);
    const anggaran = hitungAnggaran();

    let arsip = [];

    if (dbArsip) {
        try {
            arsip = await ambilSemuaArsip();
        } catch (error) {
            console.error(error);
        }
    }

    document.getElementById("lapAnggota").textContent =
        anggota.length;

    document.getElementById("lapProgram").textContent =
        program.length;

    document.getElementById("lapArsip").textContent =
        arsip.length;

    document.getElementById("lapPemasukan").textContent =
        formatRupiah(anggaran.pemasukan);

    document.getElementById("lapPengeluaran").textContent =
        formatRupiah(anggaran.pengeluaran);

    document.getElementById("lapSaldo").textContent =
        formatRupiah(anggaran.saldo);
}

/* =====================================================
   14. EKSPOR DATA CSV
===================================================== */

function eksporCSV(namaFile, headers, rows) {

    const escapeCSV = value =>
        '"' + String(value ?? "").replace(/"/g, '""') + '"';

    const isi = [
        headers,
        ...rows
    ].map(row => row.map(escapeCSV).join(",")).join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + isi],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = namaFile + ".csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.querySelectorAll("[data-export]")
    .forEach(button => {

        button.addEventListener("click", async function () {

            const jenis = this.dataset.export;

            if (jenis === "anggota") {

                const data = ambilData(STORAGE.anggota);

                eksporCSV("Laporan_Anggota_KSR", [
                    "Nama",
                    "NIM",
                    "Departemen",
                    "Jabatan",
                    "Nomor HP",
                    "Status"
                ], data.map(item => [
                    item.nama,
                    item.nim,
                    item.departemen,
                    item.jabatan,
                    item.hp,
                    item.status
                ]));

            }

            if (jenis === "program") {

                const data = ambilData(STORAGE.program);

                eksporCSV("Laporan_Program_Kerja_KSR", [
                    "Nama Program",
                    "Departemen",
                    "Tanggal",
                    "Penanggung Jawab",
                    "Status"
                ], data.map(item => [
                    item.nama,
                    item.departemen,
                    item.tanggal,
                    item.pj,
                    item.status
                ]));

            }

            if (jenis === "anggaran") {

                const data = ambilData(STORAGE.anggaran);

                eksporCSV("Laporan_Anggaran_KSR", [
                    "Keterangan",
                    "Jenis",
                    "Nominal",
                    "Tanggal"
                ], data.map(item => [
                    item.keterangan,
                    item.jenis,
                    item.nominal,
                    item.tanggal
                ]));

            }

            if (jenis === "arsip") {

                if (!dbArsip) {
                    alert("Database arsip belum siap.");
                    return;
                }

                const data = await ambilSemuaArsip();

                eksporCSV("Laporan_Arsip_KSR", [
                    "Nama Kegiatan",
                    "Jenis",
                    "Departemen",
                    "Tanggal",
                    "Penanggung Jawab",
                    "Keterangan",
                    "Jumlah File"
                ], data.map(item => [
                    item.nama,
                    item.jenis,
                    item.departemen,
                    item.tanggal,
                    item.pj,
                    item.keterangan,
                    item.files.length
                ]));
            }
        });
    });

/* =====================================================
   15. INISIALISASI APLIKASI
===================================================== */

function tampilkanSemuaData() {

    tampilkanAnggota();

    tampilkanProgram();

    tampilkanAnggaran();

    tampilkanDashboard();

    tampilkanLaporan();
}

async function mulaiAplikasi() {

    try {

        await bukaDatabaseArsip();

        await tampilkanArsip();

        tampilkanSemuaData();

        console.log(
            "Sistem Informasi KSR ITG berhasil dijalankan."
        );

    } catch (error) {

        console.error("Database arsip gagal dibuka:", error);

        alert(
            "Penyimpanan arsip tidak dapat dibuka. " +
            "Silakan gunakan browser terbaru melalui Live Server."
        );

        tampilkanSemuaData();
    }
}

mulaiAplikasi();
