"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "xterm/css/xterm.css";
import { ESPLoader, Transport } from "@/lib/lib_local";

export default function ESPToolPage() {
  const termRef = useRef(null);
  const termInstanceRef = useRef(null);
  const [rows, setRows] = useState([
    { id: 1, offset: "0x1000", fileData: null, fileName: "", progress: 0 },
  ]);
  const [connectedChip, setConnectedChip] = useState(null);
  const [connected, setConnected] = useState(false);
  const [deviceRef, setDeviceRef] = useState(null);
  const transportRef = useRef(null);
  const esploaderRef = useRef(null);
  const [debugLogging, setDebugLogging] = useState(false);
  const [baudrate, setBaudrate] = useState("115200");
  const [consoleBaud, setConsoleBaud] = useState("115200");
  const [consoleRunning, setConsoleRunning] = useState(false);
  const isUnmounted = useRef(false);

  // === Khởi tạo terminal ===
  useEffect(() => {
    isUnmounted.current = false;
    (async () => {
      if (typeof window === "undefined") return;

      const { Terminal } = await import("xterm");
      const CryptoJS = (await import("crypto-js")).default;
      const serialPoly = (await import("web-serial-polyfill")).serial;

      termInstanceRef.current = { CryptoJS };

      const serialLib =
        !navigator.serial && navigator.usb ? serialPoly : navigator.serial;

      const term = new Terminal({
        cols: 120,
        rows: 28,
        convertEol: true,
      });
      term.open(termRef.current);
      term.writeln("✅ Giao diện nạp ESP đã sẵn sàng");
      term.writeln("");

      termInstanceRef.current.term = term;
      termInstanceRef.current.serialLib = serialLib;
    })();

    return () => {
      isUnmounted.current = true;
      try {
        const t = termInstanceRef.current?.term;
        if (t) t.dispose();
      } catch {}
    };
  }, []);

  // === Viết ra terminal ===
  function termWriteLn(txt) {
    const t = termInstanceRef.current?.term;
    if (t) t.writeln(txt);
  }
  function termWrite(txt) {
    const t = termInstanceRef.current?.term;
    if (t) t.write(txt);
  }

  // === Quản lý file rows ===
  function addRow() {
    setRows((prev) => [
      ...prev,
      { id: Date.now(), offset: "0x1000", fileData: null, fileName: "", progress: 0 },
    ]);
  }
  function removeRow(id) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }
  function onOffsetChange(id, v) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, offset: v } : r)));
  }
  function onFileChange(id, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const bin = ev.target.result;
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, fileData: bin, fileName: file.name } : r))
      );
      termWriteLn(`📥 Đã tải file "${file.name}"`);
    };
    reader.readAsBinaryString(file);
  }

  // === Kết nối / Ngắt / Xóa / Reset ===
  async function handleConnect() {
    try {
      const serialLib = termInstanceRef.current?.serialLib || navigator.serial;
      if (!serialLib) {
        termWriteLn("❌ Trình duyệt không hỗ trợ Web Serial API.");
        return;
      }
      let device = deviceRef;
      if (!device) {
        device = await serialLib.requestPort({});
        setDeviceRef(device);
      }
      transportRef.current = new Transport(device, true);

      esploaderRef.current = new ESPLoader({
        transport: transportRef.current,
        baudrate: parseInt(baudrate),
        terminal: {
          clean: () => termInstanceRef.current?.term?.clear(),
          writeLine: (d) => termWriteLn(d),
          write: (d) => termWrite(d),
        },
        debugLogging,
      });

      termWriteLn("🔌 Đang kết nối thiết bị...");
      const chip = await esploaderRef.current.main();
      setConnectedChip(chip);
      setConnected(true);
      termWriteLn(`✅ Đã kết nối tới: ${chip}`);
    } catch (e) {
      termWriteLn(`❌ Lỗi kết nối: ${e?.message || e}`);
      console.error(e);
    }
  }

  async function handleDisconnect() {
    try {
      if (transportRef.current) {
        await transportRef.current.disconnect();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConnected(false);
      setConnectedChip(null);
      setDeviceRef(null);
      transportRef.current = null;
      esploaderRef.current = null;
      termInstanceRef.current?.term?.reset();
      termWriteLn("🔌 Đã ngắt kết nối");
    }
  }

  async function handleReset() {
    try {
      if (transportRef.current) {
        await transportRef.current.setDTR(false);
        await new Promise((r) => setTimeout(r, 100));
        await transportRef.current.setDTR(true);
        termWriteLn("🔁 Đã reset thiết bị (DTR)");
      }
    } catch (e) {
      termWriteLn(`❌ Lỗi reset: ${e?.message || e}`);
    }
  }

  async function handleErase() {
    termWriteLn("🧹 Đang xóa flash...");
    try {
      if (!esploaderRef.current) {
        termWriteLn("❌ Chưa kết nối thiết bị.");
        return;
      }
      await esploaderRef.current.eraseFlash();
      termWriteLn("✅ Đã xóa flash thành công.");
    } catch (e) {
      termWriteLn(`❌ Lỗi khi xóa flash: ${e?.message || e}`);
    }
  }

  // === Ghi chương trình ===
  function validateProgramInputs() {
    const offsets = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const offset = parseInt(r.offset);
      if (Number.isNaN(offset)) return `Ô địa chỉ hàng ${i + 1} không hợp lệ.`;
      if (offsets.includes(offset)) return `Ô địa chỉ hàng ${i + 1} bị trùng.`;
      offsets.push(offset);
      if (!r.fileData) return `Chưa chọn file ở hàng ${i + 1}.`;
    }
    return "ok";
  }

  async function handleProgram() {
    const err = validateProgramInputs();
    if (err !== "ok") {
      termWriteLn(`❌ Lỗi nạp: ${err}`);
      return;
    }
    if (!esploaderRef.current) {
      termWriteLn("❌ Vui lòng kết nối thiết bị trước khi nạp.");
      return;
    }

    const fileArray = rows.map((r) => ({
      data: r.fileData,
      address: parseInt(r.offset),
    }));

    const reportProgress = (fileIndex, written, total) => {
      setRows((prev) =>
        prev.map((row, idx) =>
          idx === fileIndex
            ? { ...row, progress: Math.round((written / total) * 100) }
            : row
        )
      );
    };

    termWriteLn("⚙️ Đang nạp chương trình...");
    try {
      const CryptoJS = termInstanceRef.current.CryptoJS;
      await esploaderRef.current.writeFlash({
        fileArray,
        eraseAll: false,
        compress: true,
        reportProgress,
        calculateMD5Hash: (image) =>
          CryptoJS.MD5(CryptoJS.enc.Latin1.parse(image)),
      });
      await esploaderRef.current.after();
      termWriteLn("✅ Nạp chương trình thành công.");
    } catch (e) {
      termWriteLn(`❌ Lỗi nạp: ${e?.message || e}`);
    } finally {
      setRows((prev) => prev.map((r) => ({ ...r, progress: 0 })));
    }
  }

  // === Render giao diện ===
  const renderRows = () =>
    rows.map((r, idx) => (
      <tr key={r.id}>
        <td>
          <input
            className="form-control form-control-sm"
            value={r.offset}
            onChange={(e) => onOffsetChange(r.id, e.target.value)}
          />
        </td>
        <td>
          <input
            className="form-control form-control-sm"
            type="file"
            onChange={(e) => onFileChange(r.id, e.target.files?.[0])}
          />
          {r.fileName && <small className="text-muted">{r.fileName}</small>}
        </td>
        <td style={{ width: "180px" }}>
          {r.progress > 0 && (
            <>
              <progress
                value={r.progress}
                max="100"
                style={{ width: "100%" }}
              />
              <small>{r.progress}%</small>
            </>
          )}
        </td>
        <td>
          {idx > 0 && (
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => removeRow(r.id)}
            >
              Xóa
            </button>
          )}
        </td>
      </tr>
    ));

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.js" />
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="text-primary mb-0">Trình nạp ESP Từ Máy Tính</h2>
          <Link href="/" className="btn btn-outline-secondary btn-sm">
            ← Trở về trang Nạp Frimware
          </Link>
        </div>
        <p className="text-muted mb-4">
          Công cụ nạp firmware ESP32 / ESP8266 trực tiếp trên trình duyệt
        </p>

        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="form-check form-switch d-flex justify-content-end mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="debugLogging"
                checked={debugLogging}
                onChange={(e) => setDebugLogging(e.target.checked)}
              />
              <label className="form-check-label ms-2" htmlFor="debugLogging">
                Hiện log gỡ lỗi
              </label>
            </div>

            <div className="row g-4">
              <div className="col-lg-7">
                <div
                  style={{
                    background: "#f5f9ff",
                    padding: 16,
                    borderRadius: 8,
                  }}
                >
                  <h5 className="mb-3">Nạp chương trình</h5>

                  <div className="mb-3">
                    <label className="form-label me-2">Baudrate:</label>
                    <select
                      value={baudrate}
                      onChange={(e) => setBaudrate(e.target.value)}
                      className="form-select form-select-sm w-auto d-inline-block"
                    >
                      <option value="921600">921600</option>
                      <option value="460800">460800</option>
                      <option value="230400">230400</option>
                      <option value="115200">115200</option>
                    </select>
                  </div>

                  <div className="d-flex gap-2 mb-3 flex-wrap">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleConnect}
                      disabled={connected}
                    >
                      Kết nối
                    </button>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={handleDisconnect}
                      disabled={!connected}
                    >
                      Ngắt kết nối
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={handleErase}
                      disabled={!connected}
                    >
                      Xóa Flash
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead className="table-light">
                        <tr>
                          <th>Địa chỉ Flash</th>
                          <th>File</th>
                          <th style={{ width: 180 }}>Tiến độ</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>{renderRows()}</tbody>
                    </table>
                  </div>

                  <div className="d-flex gap-2 mt-2">
                    <button className="btn btn-success btn-sm" onClick={addRow}>
                      Thêm file
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleProgram}
                      disabled={!connected}
                    >
                      Nạp chương trình
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div
                  style={{
                    background: "#fff",
                    padding: 16,
                    borderRadius: 8,
                    border: "1px solid #dee2e6",
                  }}
                >
                  <h5 className="mb-3">Console</h5>
                  <div className="mb-3">
                    <label className="form-label me-2">Baudrate:</label>
                    <select
                      value={consoleBaud}
                      onChange={(e) => setConsoleBaud(e.target.value)}
                      className="form-select form-select-sm w-auto d-inline-block"
                    >
                      <option value="115200">115200</option>
                      <option value="74880">74880</option>
                    </select>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => termWriteLn("Console đang phát triển...")}
                    >
                      Bắt đầu
                    </button>
                    <button className="btn btn-warning btn-sm" disabled>
                      Dừng
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={handleReset}>
                      Reset
                    </button>
                  </div>

                  <div className="mt-3">
                    <label className="form-label">Thiết bị:</label>
                    <div>
                      <strong>{connectedChip || "Chưa kết nối"}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <div>
              <h5 className="mb-2">Kết quả Terminal</h5>
              <div
                id="terminal"
                ref={termRef}
                style={{
                  minHeight: 320,
                  borderRadius: 8,
                  border: "1px solid #dee2e6",
                  background: "#000",
                  color: "#0f0",
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <footer className="text-center p-4 text-muted small">
         <span className="animated-gradient-text">
          &copy; Thành Trang Electronic
        </span>
      </footer>
    </>
  );
}
