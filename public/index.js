const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector(".browseBtn");

const bgProgress = document.querySelector(".bg-progress");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");
const percentDiv = document.querySelector("#percent");

const sharingContainer = document.querySelector(".sharing-container");
const copyURLBtn = document.querySelector("#copyURLBtn");
const fileURLInput = document.querySelector("#fileURL");
const emailForm = document.querySelector("#emailForm");


const toast = document.querySelector(".toast");


const host = "https://innshare.herokuapp.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;

const maxAllowedSize = 100*1024*1024;

browseBtn.addEventListener("click", () => {
    fileInput.click();
  });

dropZone.addEventListener("dragover", (e)=>{
    e.preventDefault();
    console.log("Dragged");

    if(!dropZone.classList.contains("dragged")){
        dropZone.classList.add("dragged");
    }
});

dropZone.addEventListener("dragleave", (e)=>{
    dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e)=>{
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files= e.dataTransfer.files;
    console.table(files);
    if(files.length){
        fileInput.files=files;
        uploadFile();
    }
});


fileInput.addEventListener("change", ()=>{
    uploadFile();
});

browseBtn.addEventListener("click", (e)=>{
    fileInput.click();
});

copyBtn.addEventListener("click", ()=>{
    fileURLInput.select();
    document.execCommand("copy");
    showToast("Link Copied");
});

const uploadFile = ()=>{

    // console.log("file added uploading");

    // files = fileInput.files;
    // const formData = new FormData();
    // formData.append("myfile", files[0]);
  
    // //show the uploader
    // progressContainer.style.display = "block";
  
    // // upload file
    // const xhr = new XMLHttpRequest();
  
    // // listen for upload progress
    // xhr.upload.onprogress = function (event) {
    //   // find the percentage of uploaded
    //   let percent = Math.round((100 * event.loaded) / event.total);
    //   progressPercent.innerText = percent;
    //   const scaleX = `scaleX(${percent / 100})`;
    //   bgProgress.style.transform = scaleX;
    //   progressBar.style.transform = scaleX;
    // };
  
    // // handle error
    // xhr.upload.onerror = function () {
    //   showToast(`Error in upload: ${xhr.status}.`);
    //   fileInput.value = ""; // reset the input
    // };
  
    // // listen for response which will give the link
    // xhr.onreadystatechange = function () {
    //   if (xhr.readyState == XMLHttpRequest.DONE) {
    //     onFileUploadSuccess(xhr.responseText);
    //   }
    // };
  
    // xhr.open("POST", uploadURL);
    // xhr.send(formData);
    
    if(fileInput.files.length > 1){
        resetFileInput();
        showToast("Only Upload 1 file!");
        return;
    }
    const file = fileInput.files[0];

    if(file.size > maxAllowedSize){
        showToast("Can't upload more than 100MB");
        resetFileInput();
        return;
    }

    progressContainer.style.display = "block";
    const formData = new FormData();
    formData.append("myFile",file);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === XMLHttpRequest.DONE){
            console.log(xhr.response);
            onUploadSuccess(JSON.parse(xhr.response));
        }
    };


    xhr.upload.onprogress = updateProgress;
    xhr.upload.onerror = ()=>{
        resetFileInput();
        showToast(`Error in upload: ${xhr.statusText}`);
    };

    xhr.open("POST", uploadURL);
    xhr.send(formData);
    
};

const updateProgress = (e)=>{
    const percent = Math.round((e.loaded / e.total) * 100);
    // console.log(percent);
    bgProgress.style.width = `${percent}%`;
    percentDiv.innerText = percent;
    progressBar.style.transform = `scaleX(${percent/100})`;
};

const onUploadSuccess = ({file: url})=>{
    console.log(url);
    resetFileInput();
    emailForm[2].removeAttribute("disabled");
    progressContainer.style.display = "none";
    sharingContainer.style.display = "block";
    fileURLInput.value = url;
};


const resetFileInput = ()=>{
    fileInput.value = "";
};

emailForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    console.log("Submit form");
    const url = fileURLInput.value;

    const formData = {
        uuid: url.split("/").splice(-1,1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value
    };

    emailForm[2].setAttribute("disabled", "true");

    console.table(formData);

    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(formData)
    })

    .then((res) => res.json())
    .then(({success}) => {
        if(success){
            sharingContainer.style.display = "none";
            showToast("Email Sent");
        }
    });
});


let toastTimer;
const showToast = (msg)=>{
    toast.innerText = msg; 
    toast.style.transform = "translateY(-50%, 0)";

    clearTimeout(toastTimer);
    toastTimer =  setTimeout(()=>{
    toast.style.transform = "translateY(-50%, 60px)"
    },2000);
};