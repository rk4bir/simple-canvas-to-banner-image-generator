(function() {
    const editor = {
        width: document.getElementById("adWidth"),
        height: document.getElementById("adHeight"),
        title: document.getElementById("adTitle"),
        desc: document.getElementById("adDesc"),
        website: document.getElementById("adWebsite"),
        fontColor: document.getElementById("adFontColor"),
        backgroundColor: document.getElementById("adBackgroundColor"),
        backgroundOpacity: document.getElementById("adBackgroundOpacity"),
        backgroundImage: null,
        titleFontSize: document.getElementById("adTitleFontSize"),
        descFontSize: document.getElementById("adDescFontSize"),
        websiteFontSize: document.getElementById("adWebsiteFontSize"),
        fontFamily: document.getElementById("adFontFamily")
    }

    const canvas = document.getElementById("billboardBannerCanvas");
    const placeholderBannerGeneratorImage = document.getElementById("placeholderBannerGeneratorImage")

    function initForm() {
        editor.width.value = 1920
        editor.height.value = 1080
        editor.title.value = "Lorem ipsum dolor sit"
        editor.desc.value = "Lorem ipsum dolor sit, amet consectetur adipisicing elit."
        editor.website.value = "https://github.com/rk4bir"
        editor.fontColor.value = "#ffffff"
        editor.backgroundColor.value = "#198754"
        editor.backgroundOpacity.value = 0.8
        editor.backgroundImage = null
        editor.titleFontSize.value = 64
        editor.descFontSize.value = 32
        editor.websiteFontSize.value = 24
        editor.fontFamily.value = "BMJUA"
    }

    function getSubtitleLines() {
        const subtitle = editor.desc.value
        const width = editor.width.value
        var availableArea = width - (width / 12)
        var words = subtitle.split(" ")
        const fs = editor.descFontSize.value
        var textWidth = 0
        var line = ""
        var lines = []
        for(let i=0; i<words.length; i++) {
            word = words[i]
            textWidth += word.length * fs
            if(textWidth < availableArea) {
                line += " " + word
            } else {
                lines.push(line)
                textWidth = word.length * fs
                line = word
            }

            if(i === (words.length-1) && lines.indexOf(line) === -1) {
                lines.push(line)
            }
        }
        return lines.map(item => item.trim())
    }

    function updateCanvas() {
        console.log(editor.width.value + 'x' + editor.height.value)
        let ctx = canvas.getContext("2d")
        const width = editor.width.value;
        const height = editor.height.value;
        
        // canvas height and width 
        canvas.width = width;
        canvas.height = height;


        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = editor.backgroundColor.value;
        ctx.fillRect(0, 0, width, height);

        // canvas styles
        
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = editor.fontColor.value;

        const backgroundImage = editor.backgroundImage;
        if (backgroundImage) {
            const { width: imageWidth, height: imageHeight } = backgroundImage;
            const ratio = Math.max(width / imageWidth, height / imageHeight);

            ctx.globalAlpha = editor.backgroundOpacity.value;
            ctx.drawImage(
                backgroundImage,
                0,
                0,
                imageWidth,
                imageHeight,
                (width - imageWidth * ratio) / 2,
                (height - imageHeight * ratio) / 2,
                imageWidth * ratio,
                imageHeight * ratio
            );
            ctx.globalAlpha = 1;
        }
        
        // title
        let lines = editor.title.value.split("\n");
        let lineHeight = editor.titleFontSize.value * 1.5;
        let firstLineCoord = (height / 2 - height / 4) - (0.5 * lines.length - 0.5) * lineHeight;
        ctx.font = `${editor.titleFontSize.value}px ${editor.fontFamily.value}`;
        lines.forEach((line, index) => {
            ctx.fillText(line, width / 2, firstLineCoord + index * lineHeight);
        });

        // description
        ctx.font = `${editor.descFontSize.value}px ${editor.fontFamily.value}`;
        let descLines = getSubtitleLines()
        let descPaddingTop = firstLineCoord + lineHeight
        descLines.forEach((line, index) => {
            ctx.fillText(
                line,
                width / 2,
                descPaddingTop + index * 1.5 * editor.descFontSize.value + 25
            );
        });

        // Tag
        ctx.font = `${editor.websiteFontSize.value}px ${editor.fontFamily.value}`;
        ctx.fillText(
            editor.website.value, 
            width / 2, 
            height - height / 4
        );
    }

    function init() {
        initForm()
        updateCanvas()
    }

    init()

    document.addEventListener("bannerForm.editorChanged", function(event) {
        /* Listen for editor change */
        updateCanvas()
    })

    document.addEventListener("bannerForm.backgroundImageChanged", function() {
        editor.backgroundColor.value = "#f5f5f5"
        updateCanvas()
    })

    document.getElementById("adBackgroundImage").addEventListener("change", function(e) {
        const image = e.target.files[0]
        if (image) {
            var reader = new FileReader();
            reader.readAsDataURL(image);
            reader.onload = function(e) {
                placeholderBannerGeneratorImage.src = e.target.result
                editor.backgroundImage = placeholderBannerGeneratorImage
                // trigger editorChanged event
                document.dispatchEvent(new CustomEvent('bannerForm.editorChanged'))
            };
        } else {
            editor.backgroundImage = null
        }
    })
    editor.height.addEventListener("keyup", function(e) {
        updateCanvas()
    })
    editor.width.addEventListener("keyup", function(e) {
        updateCanvas()
    })

    editor.backgroundColor.addEventListener("input", function() {
        updateCanvas()
    })
    editor.fontColor.addEventListener("input", function() {
        updateCanvas()
    })
    editor.backgroundOpacity.addEventListener("change", function() {
        updateCanvas()
    })

    document.getElementById("downloadAsImageButton").addEventListener("click", async function(e) {
        if (!canvas) {
            alert("Invalid canvas!")
            return;
        }
        
        let fileName = placeholderBannerGeneratorImage.src.toLowerCase().split(" ").join("-")
        const resp = await fetch(canvas.toDataURL())
        let blob = await resp.blob()
        const blobImage = URL.createObjectURL(blob)
        // trigger an event to communicate with Angular
        let event = new CustomEvent('bannerForm.newImageCreated', {
            detail: {
                fileName: fileName,
                blobImageUrl: blobImage
            }
        });
        document.dispatchEvent(event)
    })
})();



/* 
Optimized solution
- listen to editor changes and triggers event to the plugin
*/
const banarGeneratorForm = document.getElementById("banarGeneratorForm");
banarGeneratorForm.addEventListener('keyup', function() {
    document.dispatchEvent(new CustomEvent('bannerForm.editorChanged'));
})
banarGeneratorForm.addEventListener('change', function(e) {
    let imageChanged = e.target.tagName === "INPUT" && e.target.type === "file"
    if (imageChanged) {
        document.dispatchEvent(new CustomEvent('bannerForm.editorChanged'));
        document.dispatchEvent(new CustomEvent('bannerForm.backgroundImageChanged'));
    }
    else {
        document.dispatchEvent(new CustomEvent('bannerForm.editorChanged'));
    }
})
banarGeneratorForm.addEventListener('click', function() {
    document.dispatchEvent(new CustomEvent('bannerForm.editorChanged'));
})


// open background image input
document.getElementById("imageUploaderBanner").addEventListener('click', function(e) {
    e.preventDefault()
    document.getElementById("adBackgroundImage").click()
})



document.addEventListener("bannerForm.newImageCreated", function(event) {
    /*
        banner generated
        -------------------------
        event.detail = {
            fileName: fileName,
            blobImageUrl: blobImage
        }
    */
    let urlAsList = event.detail.blobImageUrl.toString().split("/")
    let fileName = urlAsList[urlAsList.length - 1]
    const a = document.createElement("a")
    a.download = fileName + ".png"
    a.href = event.detail.blobImageUrl
    document.body.append(a)
    a.click()
    a.remove()
})
