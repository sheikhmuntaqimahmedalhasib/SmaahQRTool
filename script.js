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

// এই ফাংশনটি এখন ল্যাপটপ এবং মোবাইল দুই জায়গাতেই কাজ করবে
function downloadQR(){
    const canvas = qrBox.querySelector("canvas");
    const img = qrBox.querySelector("img");

    if(!canvas && !img){
        alert("আগে QR Code জেনারেট করুন");
        return;
    }

    // ল্যাপটপ এবং মোবাইল দুইটার জন্যই ডাটা ইউআরএল তৈরি
    let dataURL;
    if (img && img.src.startsWith("data")) {
        dataURL = img.src;
    } else if (canvas) {
        dataURL = canvas.toDataURL("image/png");
    }

    if(!dataURL) {
        alert("কিউআর কোড ইমেজ পাওয়া যায়নি!");
        return;
    }

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if(isMobile){
        // মোবাইলের জন্য পপ-আপ না করে সরাসরি নিউ ট্যাব বা ডাউনলোড ট্রাই করবে
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "SmaahQR.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // ব্যাকআপ হিসেবে নতুন ট্যাবে ওপেন করা (যাতে ইউজার সেভ করতে পারে)
        setTimeout(() => {
            const win = window.open();
            win.document.write(`<img src="${dataURL}" style="width:100%;"><p style="text-align:center;">Long press to save image</p>`);
        }, 500);
    } else {
        // ল্যাপটপের জন্য সরাসরি ডাউনলোড
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = "SmaahQR.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
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