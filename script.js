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
    new QRCode(qrBox,{ text, width:180, height:180 });
}

function downloadQR(){
    const img = qrBox.querySelector("img");
    if(!img) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "SmaahTextToQr.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
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

function downloadText(){
    if(!decodedData) return;

    const encoded = encodeURIComponent(decodedData);
    const a = document.createElement("a");

    a.href = "data:text/plain;charset=utf-8," + encoded;
    a.download = "SmaahQrToText.txt";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function copyText(){
    if(!decodedData) return;
    navigator.clipboard.writeText(decodedData);
    alert("Copied!");
}

function goToBrowser(){
    if(decodedData.startsWith("http")){
        window.open(decodedData,"_blank");
    }else{
        alert("Not a valid URL");
    }
}