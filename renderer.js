// ============================================================
// Normal Map Converter — Renderer
// ============================================================

// --- i18n ---
var i18n = {
    zh: {
        title: '法线贴图转换器', tabSingle: '单张转换', tabBatch: '批量转换',
        placeholderSingle: '选择一张法线贴图...', browse: '浏览...',
        original: '原图', converted: '转换预览', convertSave: '转换并保存',
        addImages: '添加图片', addFolder: '添加文件夹', clear: '清空',
        colIndex: '#', colFilename: '文件名', colSize: '大小', colStatus: '状态',
        output: '输出目录:', ready: '就绪', batchConvert: '批量转换',
        loading: '加载中...', loaded: '已加载: ', saving: '保存中...',
        saved: '已保存: ', selectFirst: '请先选择一张图片',
        saveFailed: '保存失败: ', loadFailed: '加载失败: ',
        batchStarted: '批量转换开始...', batchDone: '完成: ',
        batchOk: ' 成功', batchFail: ' 失败', cancelled: '已取消',
        cleared: '已清空', filesAdded: ' 个文件已添加',
        addFilesFirst: '请先添加文件', setOutput: '请指定输出目录',
        doneStatus: '完成', failedStatus: '失败',
        processingStatus: '处理中...', readyStatus: '就绪', waitingStatus: '等待中...',
        error: '错误: ',
    },
    en: {
        title: 'Normal Map Converter', tabSingle: 'Single', tabBatch: 'Batch',
        placeholderSingle: 'Select a normal map...', browse: 'Browse...',
        original: 'Original', converted: 'Converted', convertSave: 'Convert & Save',
        addImages: 'Add Images', addFolder: 'Add Folder', clear: 'Clear',
        colIndex: '#', colFilename: 'Filename', colSize: 'Size', colStatus: 'Status',
        output: 'Output:', ready: 'Ready', batchConvert: 'Batch Convert',
        loading: 'Loading...', loaded: 'Loaded: ', saving: 'Saving...',
        saved: 'Saved: ', selectFirst: 'Select an image first.',
        saveFailed: 'Save failed: ', loadFailed: 'Load failed: ',
        batchStarted: 'Batch started...', batchDone: 'Done: ',
        batchOk: ' ok', batchFail: ' failed', cancelled: 'Cancelled',
        cleared: 'Cleared', filesAdded: ' files added',
        addFilesFirst: 'Add files first.', setOutput: 'Set output directory.',
        doneStatus: 'Done', failedStatus: 'Failed',
        processingStatus: 'Processing...', readyStatus: 'Ready', waitingStatus: 'Waiting...',
        error: 'Error: ',
    }
};

var lang = (function() { try { return localStorage.getItem('nmfix-lang') || 'zh'; } catch(e) { return 'zh'; } })();
function t(key) { return (i18n[lang] && i18n[lang][key]) || key; }
function toggleLang() {
    lang = lang === 'zh' ? 'en' : 'zh';
    try { localStorage.setItem('nmfix-lang', lang); } catch(e) {}
    applyI18n();
}
function applyI18n() {
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
        els[i].textContent = t(els[i].getAttribute('data-i18n'));
    }
    var phs = document.querySelectorAll('[data-i18n-placeholder]');
    for (var i = 0; i < phs.length; i++) {
        phs[i].placeholder = t(phs[i].getAttribute('data-i18n-placeholder'));
    }
    var st = document.getElementById('statusbar');
    var pt = document.getElementById('progress-text');
    if (st) st.textContent = t('ready');
    if (pt) pt.textContent = t('ready');
}

// --- State ---
var singleFilePath = null;
var singleConvertedData = null;
var batchFiles = [];

// --- Init on DOM ready ---
function init() {
    // Title bar
    var btnMin = document.getElementById('btn-min');
    var btnMax = document.getElementById('btn-max');
    var btnClose = document.getElementById('btn-close');
    if (btnMin) btnMin.onclick = function() { window.api.minimize(); };
    if (btnMax) btnMax.onclick = function() { window.api.maximize(); };
    if (btnClose) btnClose.onclick = function() { window.api.close(); };

    // Lang buttons
    var btnLang1 = document.getElementById('btn-lang');
    var btnLang2 = document.getElementById('btn-lang2');
    if (btnLang1) btnLang1.onclick = toggleLang;
    if (btnLang2) btnLang2.onclick = toggleLang;
    applyI18n();

    // Tabs
    var tabs = document.querySelectorAll('.tab');
    var panels = document.querySelectorAll('.panel');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].onclick = function() {
            var tabName = this.getAttribute('data-tab');
            for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove('active');
            for (var j = 0; j < panels.length; j++) panels[j].classList.remove('active');
            this.classList.add('active');
            var panel = document.getElementById('panel-' + tabName);
            if (panel) panel.classList.add('active');
        };
    }

    // Single mode
    var btnBrowseSingle = document.getElementById('btn-browse-single');
    if (btnBrowseSingle) btnBrowseSingle.onclick = function() {
        window.api.openFile().then(function(p) { if (p) loadSingle(p); });
    };

    var btnConvertSingle = document.getElementById('btn-convert-single');
    if (btnConvertSingle) btnConvertSingle.onclick = function() { convertSingle(); };

    // Batch mode
    var btnAddFiles = document.getElementById('btn-add-files');
    if (btnAddFiles) btnAddFiles.onclick = function() {
        window.api.openFiles().then(function(paths) { if (paths && paths.length) addBatchFiles(paths); });
    };

    var btnAddFolder = document.getElementById('btn-add-folder');
    if (btnAddFolder) btnAddFolder.onclick = function() {
        window.api.openFolder().then(function(folder) {
            if (folder) window.api.listImages(folder).then(function(paths) {
                if (paths && paths.length) addBatchFiles(paths);
            });
        });
    };

    var btnClear = document.getElementById('btn-clear');
    if (btnClear) btnClear.onclick = function() {
        batchFiles.length = 0; renderBatchList();
        setStatus(t('cleared'));
    };

    var btnBrowseOutput = document.getElementById('btn-browse-output');
    if (btnBrowseOutput) btnBrowseOutput.onclick = function() {
        window.api.openFolder().then(function(folder) {
            if (folder) document.getElementById('batch-output-dir').value = folder;
        });
    };

    var btnBatchConvert = document.getElementById('btn-batch-convert');
    if (btnBatchConvert) btnBatchConvert.onclick = function() { batchConvert(); };
}

function setStatus(msg) {
    var st = document.getElementById('statusbar');
    if (st) st.textContent = msg;
}

// --- Single Mode ---
function loadSingle(filePath) {
    singleFilePath = filePath;
    var singlePath = document.getElementById('single-path');
    if (singlePath) { singlePath.value = filePath; singlePath.style.color = '#1a1a1a'; }
    setStatus(t('loading'));

    window.api.readFile(filePath).then(function(b64) {
        var raw = atob(b64);
        var bytes = new Uint8Array(raw.length);
        for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        return decodeImage(bytes, filePath);
    }).then(function(imgData) {
        drawToCanvas(document.getElementById('canvas-original'), imgData);
        singleConvertedData = convertNormalMap(imgData);
        drawToCanvas(document.getElementById('canvas-converted'), singleConvertedData);
        setStatus(t('loaded') + filePath.split('\\').pop());
    }).catch(function(e) {
        setStatus(t('loadFailed') + e.message);
    });
}

function convertSingle() {
    if (!singleConvertedData) { setStatus(t('selectFirst')); return; }
    var defaultName = singleFilePath ? singleFilePath.replace(/\.[^.]+$/, '') + '_fixed.png' : 'converted.png';
    window.api.saveFile(defaultName).then(function(outPath) {
        if (!outPath) return;
        setStatus(t('saving'));
        var b64 = canvasToPNG(singleConvertedData);
        window.api.savePNG(outPath, b64).then(function() {
            setStatus(t('saved') + outPath.split('\\').pop());
        });
    }).catch(function(e) {
        setStatus(t('saveFailed') + e.message);
    });
}

// --- Batch Mode ---
function addBatchFiles(paths) {
    for (var i = 0; i < paths.length; i++) {
        var p = paths[i];
        var dup = false;
        for (var j = 0; j < batchFiles.length; j++) { if (batchFiles[j].path === p) { dup = true; break; } }
        if (dup) continue;
        batchFiles.push({ path: p, name: p.split('\\').pop(), size: '?', status: t('readyStatus') });
    }
    renderBatchList();
    setStatus(batchFiles.length + t('filesAdded'));
}

function renderBatchList() {
    var tbody = document.querySelector('#batch-list tbody');
    if (!tbody) return;
    var html = '';
    for (var i = 0; i < batchFiles.length; i++) {
        var f = batchFiles[i];
        html += '<tr><td>' + (i + 1) + '</td><td>' + escHtml(f.name) + '</td><td>' + f.size + '</td><td>' + f.status + '</td></tr>';
    }
    tbody.innerHTML = html;
}

function batchConvert() {
    if (batchFiles.length === 0) { setStatus(t('addFilesFirst')); return; }
    var outDir = document.getElementById('batch-output-dir').value.trim();
    if (!outDir) { setStatus(t('setOutput')); return; }
    if (!/^[A-Za-z]:\\/.test(outDir) && batchFiles.length > 0) {
        var firstDir = batchFiles[0].path.replace(/[^\\]+$/, '');
        outDir = firstDir + outDir;
    }

    setStatus(t('batchStarted'));
    var progressFill = document.getElementById('progress-fill');
    var progressText = document.getElementById('progress-text');
    if (progressFill) progressFill.style.width = '0%';
    if (progressText) progressText.textContent = '0%';

    var ok = 0, fail = 0;
    var total = batchFiles.length;

    function processNext(i) {
        if (i >= total) {
            setStatus(t('batchDone') + ok + t('batchOk') + ', ' + fail + t('batchFail'));
            return;
        }
        var f = batchFiles[i];
        f.status = t('processingStatus'); renderBatchList();
        window.api.readFile(f.path).then(function(b64) {
            var raw2 = atob(b64); var bytes = new Uint8Array(raw2.length);
            for (var j = 0; j < raw2.length; j++) bytes[j] = raw2.charCodeAt(j);
            return decodeImage(bytes, f.path);
        }).then(function(imgData) {
            var converted = convertNormalMap(imgData);
            var outName = f.name.replace(/\.[^.]+$/, '') + '_fixed.png';
            var outPath = outDir + '\\' + outName;
            var b64png = canvasToPNG(converted);
            return window.api.savePNG(outPath, b64png);
        }).then(function() {
            ok++; f.status = t('doneStatus');
        }).catch(function(e) {
            fail++; f.status = t('failedStatus');
        }).finally(function() {
            var pct = Math.round((i + 1) / total * 100);
            if (progressFill) progressFill.style.width = pct + '%';
            if (progressText) progressText.textContent = pct + '%';
            renderBatchList();
            processNext(i + 1);
        });
    }
    processNext(0);
}

// ================================================================
// Normal Map Conversion (Canvas API)
// ================================================================
function convertNormalMap(src) {
    var w = src.width, h = src.height, data = src.data;
    var out = new Uint8ClampedArray(data.length);
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var si = (y * w + x) * 4;
            var di = (y * w + x) * 4;
            out[di]     = 255 - data[si];     // R: color invert
            out[di + 1] = data[si + 1];       // G: unchanged
            out[di + 2] = 255;                // B: white
            out[di + 3] = 255;                // A: opaque
        }
    }
    return new ImageData(out, w, h);
}

// ================================================================
// Image Decoding
// ================================================================
function decodeImage(bytes, filePath) {
    var ext = filePath.split('.').pop().toLowerCase();
    if (ext === 'tga') {
        return Promise.resolve(decodeTGA(bytes));
    }
    return new Promise(function(resolve, reject) {
        var blob = new Blob([bytes]);
        var url = URL.createObjectURL(blob);
        var img = new Image();
        img.onload = function() {
            var c = document.createElement('canvas');
            c.width = img.width; c.height = img.height;
            c.getContext('2d').drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve(c.getContext('2d').getImageData(0, 0, c.width, c.height));
        };
        img.onerror = function() { reject(new Error('Cannot decode image')); };
        img.src = url;
    });
}

// TGA Decoder (uncompressed 24/32-bit + RLE)
function decodeTGA(bytes) {
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (view.getUint8(1) !== 0) throw new Error('Paletted TGA not supported');
    var imageType = view.getUint8(2);
    if (imageType !== 2 && imageType !== 10) throw new Error('TGA type ' + imageType + ' unsupported');
    var w = view.getUint16(12, true);
    var h = view.getUint16(14, true);
    var bpp = view.getUint8(16);
    if (bpp !== 24 && bpp !== 32) throw new Error('TGA bpp ' + bpp + ' unsupported');
    var imgDesc = view.getUint8(17);
    var flipY = !(imgDesc & 0x20);
    var offset = 18 + view.getUint8(0);
    var pixelCount = w * h;
    var bpr = bpp / 8;
    var out = new Uint8ClampedArray(pixelCount * 4);

    if (imageType === 2) {
        for (var i = 0; i < pixelCount; i++) {
            var b = view.getUint8(offset), g = view.getUint8(offset + 1), r = view.getUint8(offset + 2);
            var a = bpp === 32 ? view.getUint8(offset + 3) : 255;
            offset += bpr;
            var di = i * 4; out[di] = r; out[di + 1] = g; out[di + 2] = b; out[di + 3] = a;
        }
    } else {
        var i = 0;
        while (i < pixelCount) {
            var packet = view.getUint8(offset++);
            var count = (packet & 0x7F) + 1;
            if (packet & 0x80) {
                var b = view.getUint8(offset), g = view.getUint8(offset + 1), r = view.getUint8(offset + 2);
                var a = bpp === 32 ? view.getUint8(offset + 3) : 255;
                offset += bpr;
                for (var j = 0; j < count && i < pixelCount; j++, i++) {
                    var di = i * 4; out[di] = r; out[di + 1] = g; out[di + 2] = b; out[di + 3] = a;
                }
            } else {
                for (var j = 0; j < count && i < pixelCount; j++, i++) {
                    var b = view.getUint8(offset), g = view.getUint8(offset + 1), r = view.getUint8(offset + 2);
                    var a = bpp === 32 ? view.getUint8(offset + 3) : 255;
                    offset += bpr;
                    var di = i * 4; out[di] = r; out[di + 1] = g; out[di + 2] = b; out[di + 3] = a;
                }
            }
        }
    }
    if (flipY) {
        var rowSize = w * 4;
        var tmp = new Uint8ClampedArray(rowSize);
        for (var y = 0; y < h / 2; y++) {
            var top = y * rowSize, bottom = (h - 1 - y) * rowSize;
            tmp.set(out.subarray(top, top + rowSize));
            out.copyWithin(top, bottom, bottom + rowSize);
            out.set(tmp, bottom);
        }
    }
    return new ImageData(out, w, h);
}

// ================================================================
// Canvas Utilities
// ================================================================
function drawToCanvas(canvas, imageData) {
    if (!canvas) return;
    var maxW = 260, maxH = 200;
    var scale = Math.min(1, maxW / imageData.width, maxH / imageData.height);
    var dw = Math.round(imageData.width * scale);
    var dh = Math.round(imageData.height * scale);
    canvas.width = dw;
    canvas.height = dh;
    canvas.style.display = 'block';
    var tmp = document.createElement('canvas');
    tmp.width = imageData.width; tmp.height = imageData.height;
    tmp.getContext('2d').putImageData(imageData, 0, 0);
    canvas.getContext('2d').drawImage(tmp, 0, 0, dw, dh);
}

function canvasToPNG(imageData) {
    var c = document.createElement('canvas');
    c.width = imageData.width; c.height = imageData.height;
    c.getContext('2d').putImageData(imageData, 0, 0);
    return c.toDataURL('image/png').split(',')[1];
}

// ================================================================
// Helpers
// ================================================================
function escHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// --- Start ---
document.addEventListener('DOMContentLoaded', init);
