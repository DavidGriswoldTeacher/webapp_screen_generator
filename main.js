var replacements = {
    COLOR: "blue",
    TITLE: "Title",
    SCREENNAME: "generated_screen"
}


var skeleton = `<section id="SCREENNAME" class="w3-container screen">
<div id="SCREENNAME_card" class="w3-card">
    <header class="w3-container w3-COLOR" id="SCREENNAME_header">
        <h1>TITLE</h1>
    </header>
    <div class="w3-container" id="SCREENNAME_content">
        <div class="drag_receiver"></div>
    </div>
    <footer class="w3-container w3-COLOR" id="SCREENNAME_footer">
            <div class="drag_receiver"></div>
            <p><a href="#" class="return_home">Go Home</a></p>
            <div class="drag_receiver"></div>
            <p><a href="#" class="logout">Logout</a></p>
    </footer>
</div>
</section>`;


var snippets =
{
    heading: {
        html: "<h2 contenteditable=\"true\">Heading</h2>",
        count: 0
    },
    subheading: {
        html: "<h3 contenteditable=\"true\">Subheading</h3>",
        count: 0
    },
    paragraph: {
        html: "<p id='paragraph#' contenteditable=\"true\">Text</p>",
        count: 0
    },

    link: {
        html: "<p><a href=\"#\">Link</a></p>",
        count: 0
    },
    text_input: {
        html: `<p><label for='textinput#' contenteditable=\"true\">Text Input: </label>
        <input class='w3-input' type='text' id='textinput#'></p>`,
        count: 0
    },
    numeric_input: {
        html: `<p><label for='numinput#' contenteditable=\"true\">Numeric Input: </label>
        <input class='w3-input' type='number' id='numinput#'></p>`,
        count: 0
    },
    password_input: {
        html: `<p><label for='pswdinput#' contenteditable=\"true\">Password Input: </label>
        <input class='w3-input' type='password' id='pswdinput#'></p>`,
        count: 0
    },
    button: {
        html: "<p><button id='button#' class='w3-btn w3-COLOR' contenteditable=\"true\">Button</button></p>",
        count: 0
    },

    list: {
        html: "<ul><li contenteditable=\"true\">List Item 1</li><li contenteditable=\"true\">List Item 2</li><li contenteditable=\"true\">List Item 3</li></ul>",
        count: 0
    }



}

/** Build the initial page */

function initialize() {

    document.getElementById("colorInput").onchange = updateColor;
    document.getElementById("screenIdInput").oninput = updateScreenId;
    var panel = document.getElementById("panel");
    for (const type in snippets) {
        if (snippets.hasOwnProperty(type)) {
            var newDiv = document.createElement("DIV");
            newDiv.classList.add("draggable_parent");
            newDiv.id = type;
            newDiv.innerHTML = doReplacements(snippets[type].html.replaceAll('contenteditable="true"', ""));
            newDiv.draggable = true;
            newDiv.ondragstart = startPanelDrag;
            panel.appendChild(newDiv);
        }
    }


    document.getElementById("canvas_content")
        .innerHTML = doReplacements(skeleton);
    for (el of document.querySelectorAll("#canvas_content *")) {
        if (el.childNodes[0] && el.childNodes[0].nodeValue && el.childNodes[0].nodeValue.trim() !== "") {
            el.setAttribute("contenteditable", "true");
            el.oninput = (ev) => updateCode();
            el.ondrop = (ev) => { ev.preventDefault(); return false; };
            el.ondragover = (ev) => { ev.preventDefault(); return false; };
        }
    }
    for (dr of document.querySelectorAll(".drag_receiver")) {
        dr.addEventListener("dragover", highlightDragReceiver);
        dr.addEventListener("dragleave", unHighlightDragReceiver);
        dr.addEventListener("drop", dropOntoReceiver);
    }

    updateCode();
}
initialize();

function updateColor(e) {
    var oldColor = replacements.COLOR;
    replacements.COLOR = e.target.value;
    for (el of document.querySelectorAll("#canvas_content *")) {
        if (el.classList.contains("w3-" + oldColor)) {
            el.classList.remove("w3-" + oldColor);
            el.classList.add("w3-" + replacements.COLOR);
        }
    }
    updateCode();
}

function updateScreenId(e) {
    var oldId = replacements.SCREENNAME;
    var newId = e.target.value;
    if (newId.match(/^[a-zA-Z]/) && newId.match(/[^a-zA-Z0-9_]/) === null) {
        //valid id
        e.target.classList.remove("broken");
        replacements.SCREENNAME = newId;
        for (el of document.querySelectorAll("#canvas_content *")) {
            el.id = el.id.replace(oldId, newId);
        }

        updateCode();
    } else {
        e.target.classList.add("broken");
    }
}


/**
 * Start a drag operation from the panel to the canvas
 * @param {Event} event The event
 */
function startPanelDrag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function startInternalDrag(event) {
    if (event.target.id == "") event.target.id = "moving";
    event.dataTransfer.setData("text", "move " + event.target.id);
}

/**
 * Replaces all of the replacements in our replacement object
 * in s, then returns the copy
 * @param {string} s
 * @returns string
 */
function doReplacements(s) {
    for (r in replacements) {
        s = s.replaceAll(r, replacements[r]);
    }
    return s;
}


function updateCode() {
    var canvasHTML = document.getElementById("canvas_content").innerHTML;
    regex = /<div class=\"drag_receiver\">[\s]*<\/div>/gm;
    canvasHTML = canvasHTML.replace(regex, "")
    var beautifyOptions = {
        preserve_newlines: false,
        indent_size: 2
    }
    canvasHTML = canvasHTML.replaceAll('contenteditable="true"', "");
    canvasHTML = canvasHTML.replaceAll('draggable="true"', "");
    canvasHTML = canvasHTML.replaceAll(/style=".*"/gm, "");
    canvasHTML = html_beautify(canvasHTML, beautifyOptions);
    document.getElementById("html_code").innerText = canvasHTML;
}

/**
 * Style the drag receivers when dragging over them
 * @param {Event} event The event
 */
function highlightDragReceiver(event) {
    event.preventDefault();
    event.target.classList.add("drag_receiver_highlighted");
}

/**
 * Remove styling from the drag receivers
 * @param {Event} event 
 */

function unHighlightDragReceiver(event) {
    event.preventDefault();
    event.target.classList.remove("drag_receiver_highlighted");
}
/**
 * Makes a copy of the panel element in the canvas, then updates
 * the code to match
 * @param {*} event 
 */
function dropOntoReceiver(event) {
    event.preventDefault();
    event.target.classList.remove("drag_receiver_highlighted");
    var elType = event.dataTransfer.getData("text");
    if (elType.substring(0, 5) === "move ") {
        moveElementToReceiver(event);
    } else {
        var dragClone = event.target.cloneNode(true);
        dragClone.addEventListener("dragover", highlightDragReceiver);
        dragClone.addEventListener("dragleave", unHighlightDragReceiver);
        dragClone.addEventListener("drop", dropOntoReceiver);
        event.target.parentElement.insertBefore(dragClone, event.target);

        var newHTML = snippets[elType].html;
        newHTML = newHTML.replace("#", snippets[elType].count);
        newHTML = doReplacements(newHTML);
        snippets[elType].count++;

        dragClone.insertAdjacentHTML("afterend", newHTML);

        var newEl = dragClone.nextSibling;
        newEl.ondrop = (ev) => { ev.preventDefault(); return false; };
        newEl.ondragover = (ev) => { ev.preventDefault(); return false; };
        newEl.oninput = (ev) => updateCode();
        newEl.draggable = true;
        newEl.ondragstart = startInternalDrag;

        updateCode();
    }
}

function moveElementToReceiver(event) {
    var elId = event.dataTransfer.getData("text").substring(5);
    var el = document.getElementById(elId);
    if (elId == "moving") el.id = "";
    var sib = el.nextSibling;
    event.target.parentElement.insertBefore(el, event.target);
    event.target.parentElement.insertBefore(sib, el);
}