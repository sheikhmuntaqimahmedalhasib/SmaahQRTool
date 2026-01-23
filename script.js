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
        alert("আগে QR Code তৈরি করুন");
        return;
    }

    // ১. ইমেজ ডাটা নেওয়া (ক্যানভাস বা ইমেজ থেকে)
    const dataURL = (img && img.src.startsWith("data")) ? img.src : canvas.toDataURL("image/png");

    // ২. Base64 থেকে Blob তৈরি করার ফাংশন (এটিই মোবাইল ডাউনলোড নিশ্চিত করবে)
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], {type: mimeString});

    // ৩. ব্লব ইউআরএল তৈরি করে ডাউনলোড ট্রিগার করা
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SmaahQR.png";
    
    document.body.appendChild(a);
    a.click(); // এটি মোবাইলে সরাসরি ডাউনলোড শুরু করবে
    
    // ক্লিনআপ
    setTimeout(() => {
        document.body.removeChild(a);
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