var c = document.querySelector("#signature-canvas");
var hiddenField = document.querySelector("#signature");
var clear = document.querySelector(".clear");

if (c) {
    var ctx = c.getContext("2d");
    ctx.strokeStyle = "red";
    var prevX = 0,
        prevY = 0,
        currX = 0,
        currY = 0;
    var flag,
        dotFlag = false;
    function onCanvasUpdate() {
        var canvasValue = c.toDataURL();
        hiddenField.value = canvasValue;
    }

    c.addEventListener("mousedown", function (event) {
        drawSignature("mousedown", event);
    });
    c.addEventListener("mouseup", function (event) {
        drawSignature("mouseup", event);
    });

    c.addEventListener("mousemove", function (event) {
        drawSignature("mousemove", event);
    });

    clear.addEventListener("click", function (event) {
        event.preventDefault();
        hiddenField.value = "";
        var message = confirm("Do you want to clear the signature?");
        if (message) {
            ctx.clearRect(0, 0, c.width, c.height);
        }
    });

    function drawSignature(response, event) {
        if (response == "mousedown") {
            flag = true;
            dotFlag = true;
            prevX = currX;
            prevY = currY;
            currX = event.clientX - c.offsetLeft;
            currY = event.clientY - c.offsetTop;
            if (dotFlag) {
                ctx.beginPath();
                ctx.fillRect(currX, currY, 2, 2);
                ctx.closePath();
                dotFlag = false;
            }
        }
        if (response == "mouseup") {
            flag = false;
            onCanvasUpdate();
        }
        if (response == "mousemove") {
            if (flag) {
                prevX = currX;
                prevY = currY;
                currX = event.clientX - c.offsetLeft;
                currY = event.clientY - c.offsetTop;
                toDraw();
            }
        }
    }

    function toDraw() {
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.stroke();
        ctx.closePath();
    }
}
