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
    // কিউআর জেনারেট করা
    new QRCode(qrBox, {
        text: text,
        width: 180,
        height: 180
    });
}

function downloadQR() {
    const canvas = qrBox.querySelector("canvas");
    const img = qrBox.querySelector("img");

    if (!canvas && !img) {
        alert("আগে QR Code জেনারেট করুন");
        return;
    }

    // ইমেজ বা ক্যানভাস থেকে ডাটা নেওয়া
    const dataURL = (img && img.src.startsWith("data")) ? img.src : canvas.toDataURL("image/png");

    // ১. Base64 ডাটাকে বাইনারি (Blob) তে কনভার্ট করা
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    const blob = new Blob([uInt8Array], { type: contentType });

    // ২. একটি টেম্পোরারি লিঙ্ক তৈরি করা
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.href = url;
    link.download = "SmaahQR.png"; // ফাইলের নাম
    
    // ৩. ডিরেক্ট ক্লিক ট্রিগার (এটি মোবাইলে সরাসরি ফাইল ডাউনলোড শুরু করবে)
    document.body.appendChild(link);
    link.click();
    
    // ৪. কাজ শেষ হলে লিঙ্ক মুছে ফেলা
    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, 100);
}

// টেক্সট ডাউনলোডের আধুনিক এবং সেফ পদ্ধতি
function downloadText(){
    if(!decodedData) return alert("No text to download");

    const blob = new Blob([decodedData], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "SmaahText.txt";
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// বাকি ফাংশনগুলো আগের মতোই থাকবে
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