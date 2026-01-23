let decodedData = "";
let uploadedImageData = "";

window.onload = () => {
    const page = sessionStorage.getItem("qrPage");
    if(page === "qr"){
        showQRText();
    }else{
        showTextQR();
    }
};

function showTextQR(){
    textToQR.classList.remove("hidden");
    qrToText.classList.add("hidden");
    btnTextQR.classList.add("active");
    btnQRText.classList.remove("active");
    sessionStorage.setItem("qrPage","text");
}

function showQRText(){
    qrToText.classList.remove("hidden");
    textToQR.classList.add("hidden");
    btnQRText.classList.add("active");
    btnTextQR.classList.remove("active");
    decodedText.innerText = "";
    sessionStorage.setItem("qrPage","qr");
}

function generateQR(){
    const text = qrText.value.trim();
    if(!text) return alert("Enter text");
    qrBox.innerHTML = "";

    new QRCode(qrBox, {
        text: text,
        width: 150, 
        height: 150,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    setTimeout(() => {
        const qrCanvas = qrBox.querySelector('canvas');
        const qrImg = qrBox.querySelector('img');

        const style = {
            padding: "15px",
            background: "#fff",
            width: "180px",
            height: "180px",
            boxSizing: "border-box"
        };

        if(qrCanvas) Object.assign(qrCanvas.style, style);
        if(qrImg) Object.assign(qrImg.style, style);
    }, 50);
}

function getUniqueFileName(prefix, extension) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    return prefix + "_" + year + month + day + "_" + hour + minute + second + "." + extension;
}

function downloadQR() {
    const canvas = qrBox.querySelector("canvas");
    if (!canvas) {
        alert("Generate QR first");
        return;
    }

    const targetSize = 180;
    const padding = 30;
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = targetSize;
    tempCanvas.height = targetSize;

    tempCtx.fillStyle = "#ffffff";
    tempCtx.fillRect(0, 0, targetSize, targetSize);

    tempCtx.drawImage(canvas, 15, 15, 150, 150);

    const dataURL = tempCanvas.toDataURL("image/png");
    const fileName = getUniqueFileName("SmaahQR", "png");

    const parts = dataURL.split(';base64,');
    const raw = window.atob(parts[1]);
    const uInt8Array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) uInt8Array[i] = raw.charCodeAt(i);

    const blob = new Blob([uInt8Array], { type: 'image/png' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, 100);
}

function downloadText() {
    if (!decodedData) return alert("No text to download");

    const fileName = getUniqueFileName("SmaahText", "txt");

    const blob = new Blob([decodedData], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = fileName; 
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
}

function previewQR(input){
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        uploadedImageData = e.target.result;
        uploadedQR.src = uploadedImageData;
        uploadedQR.style.display = "block";
    };
    reader.readAsDataURL(file);
}

function readQR(){
    if(!uploadedImageData){
        decodedText.innerText = "No data found";
        return;
    }
    const img = new Image();
    img.src = uploadedImageData;
    img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img,0,0);
        const data = ctx.getImageData(0,0,canvas.width,canvas.height);
        const code = jsQR(data.data, canvas.width, canvas.height);
        decodedData = code ? code.data : "";
        decodedText.innerText = decodedData || "No data found";
    };
}

function copyText(){
    if(!decodedData) return;
    navigator.clipboard.writeText(decodedData).then(() => {
        alert("Copied!");
    });
}

function goToBrowser(){
    if(decodedData.startsWith("http")){
        window.open(decodedData,"_blank");
    }else{
        alert("Not a valid URL");
    }
}