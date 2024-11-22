// source: https://stackoverflow.com/a/4515470
function getLineHeight(el: HTMLElement) {
    var temp = document.createElement(el.nodeName), ret: number;
    temp.setAttribute("style", "margin:0; padding:0; "
        + "font-family:" + (el.style.fontFamily || "inherit") + "; "
        + "font-size:" + (el.style.fontSize || "inherit"));
    temp.innerHTML = "A";

    el.parentNode!.appendChild(temp);
    ret = temp.clientHeight;
    temp.parentNode!.removeChild(temp);

    return ret;
}

class Stack {
    items: string[] = []

    constructor() {
        this.items = [];
    }

    push(element: string) {
        if (this.items.length >= 6) {
            alert("Der Stack ist voll!")
            return true;
        }

        this.items.push(element);

        return false;
    }

    pop() {
        if (this.isEmpty()) {
            alert("Der Stack ist leer!");
            return;
        }
        this.items.pop();
    }

    top() {
        if (this.isEmpty()) {
            alert("Der Stack ist leer!");
            return;
        }
        alert("Top-Element: " + this.items[this.items.length - 1]);
    }

    isEmpty() {
        return this.items.length === 0;
    }

    isColor(strColor: string) {
        const s = new Option().style;
        s.color = strColor;
        return s.color !== '';
    }

    render(stackContainer : HTMLElement) {
        stackContainer.innerHTML = '';
        for (let i = 0; i < this.items.length; i++) {
            const container = document.createElement('div');
            container.classList.add('stack-element');
            container.style.backgroundColor = this.isColor(this.items[i]) ? this.items[i] : "grey";
            const label = document.createElement('span');
            label.textContent = this.items[i];

            // Neue Zeilen zum Anpassen der Textfarbe
            if (this.isColorLight(this.items[i])) {
              label.style.color = 'black';
            } else {
              label.style.color = 'white';
            }
            container.appendChild(label);
            stackContainer.appendChild(container);
        }
    }

    isColorLight(color: string) {
        // Erstellen eines temporären Elements, um die RGB-Werte zu erhalten
        const tempElem = document.createElement('div');
        tempElem.style.color = color;
        document.body.appendChild(tempElem);

        // Extrahieren der RGB-Werte
        const rgb = window.getComputedStyle(tempElem).color;
        document.body.removeChild(tempElem);

        const rgbValues = rgb.match(/\d+/g)!.map(Number);
        // Berechnung der Helligkeit anhand der RGB-Werte
        const brightness = Math.round(((rgbValues[0] * 299) +
            (rgbValues[1] * 587) +
            (rgbValues[2] * 114)) / 1000);
        // Rückgabe true, wenn die Farbe hell ist
        return brightness > 155;
    }
}

let stacks: { [key: string]: Stack } = {}

let activeLine = -1;

const codeInput  = document.getElementById('code-input')! as HTMLTextAreaElement;
const highlight = document.getElementById('code-highlight')!;

function highlightActiveLine() {
    const lineHeight = parseInt(window.getComputedStyle(codeInput).lineHeight);
    const paddingTop = parseInt(window.getComputedStyle(codeInput).paddingTop);
    
    let top = paddingTop + codeInput.offsetTop + 2;
    if (activeLine >= 0) {
        if (codeInput.offsetHeight <= (activeLine + 1.5) * lineHeight) highlight.style.opacity = "0";
        else highlight.style.opacity = "1";


        highlight.style.top = `${activeLine * lineHeight + top}px`;
        highlight.style.height = `${lineHeight}px`;
        highlight.style.width = `${codeInput.offsetWidth}px`;
    } else {
        highlight.style.opacity = "0";
    }
    document.getElementById('run-line')!.innerHTML = "Zeile " + (activeLine + 1) + " ausführen";
}

function renderStacks() {
    const stackContainer = document.getElementById("stack-container")! as HTMLDivElement;
    stackContainer.innerHTML = "";
    
    for (const [name, stack] of Object.entries(stacks)) {
        const stackE = document.createElement("div");
        stackE.classList.add("stack");

        const stackElements = document.createElement("div");
        stackElements.classList.add("stack-elements");
        stackE.appendChild(stackElements);
        stack.render(stackElements);

        const stackLabel = document.createElement("span");
        stackLabel.classList.add("stack-label");
        stackLabel.innerHTML = name;
        stackE.appendChild(stackLabel);

        stackContainer.appendChild(stackE);
    }
}

// Parser-Funktion
function parseCode(codeline: string) {
    console.log(codeline);
    // const stack = new Stack();

    // const lines = code.split('\n');
    // for (let line of lines) {
    //     line = line.trim();
    //     if (line.startsWith('stack.push')) {
    //         const color = line.match(/"([^"]+)"/)[1];
    //         let stackIsFull = stack.push(color);
    //         if (stackIsFull) { break; }
    //     } else if (line.startsWith('stack.pop')) {
    //         stack.pop();
    //     } else if (line.startsWith('stack.top')) {
    //         stack.top();
    //     } else if (line.startsWith('stack.isEmpty')) {
    //         alert(stack.isEmpty() ? "wahr" : "falsch")
    //     } else if (line.startsWith('Stack stack = new Stack()')) {
    //         // Neue Stack-Instanz, optional falls mehrere Stacks unterstützt werden sollen
    //     }
    // }
    // stack.render();

    let line = codeline.trim();
    let m: RegExpMatchArray | null;
    if ((m = line.match(/([A-Za-z0-9äÄöÖüÜ_]+)\.push\("([A-Za-z0-9äÄöÖüÜ_#]+)"\);/)) != null) {
        if (m[1] in stacks) {
            stacks[m[1]].push(m[2]);
        } else {
            alert(`Stapel ${m[1]} existiert nicht`);
        }
    } else if ((m = line.match(/([A-Za-z0-9äÄöÖüÜ_]+)\.pop\(\);/)) != null) {
        if (m[1] in stacks) {
            stacks[m[1]].pop();
        } else {
            alert(`Stapel ${m[1]} existiert nicht`);
        }
    } else if ((m = line.match(/([A-Za-z0-9äÄöÖüÜ_]+)\.top\(\);/)) != null) {
        if (m[1] in stacks) {
            stacks[m[1]].top();
        } else {
            alert(`Stapel ${m[1]} existiert nicht`);
        }
    } else if ((m = line.match(/([A-Za-z0-9äÄöÖüÜ_]+)\.isEmpty\(\);/)) != null) {
        if (m[1] in stacks) {
            alert(stacks[m[1]].isEmpty() ? `Stapel ${m[1]} ist leer` : `Stapel ${m[1]} ist nicht leer`);
        } else {
            alert(`Stapel ${m[1]} existiert nicht`);
        }
    } else if ((m = line.match(/Stack(?:<(?:[A-Z][a-zA-Z0-9_]*)?>)? *([A-Za-z0-9äÄöÖüÜ_]+) *= *new *Stack(?:<(?:[A-Z][a-zA-Z0-9_]*)?>)?\(\);/)) != null) {
        if (!(m[1] in stacks)) {
            console.log(m);
            stacks[m[1]] = new Stack();
        } else {
            alert(`Stapel ${m[1]} existiert bereits`);
        }
    }
    renderStacks();
}

function runNextLine() {
    const code = codeInput.value.trim();
    const lines = code.split('\n');
    const nextLine = activeLine + 1;
    if (lines.length >= nextLine) {
        activeLine = nextLine;
        highlightActiveLine();
        parseCode(lines[activeLine]);
    }
}

codeInput.addEventListener('input', highlightActiveLine);
new ResizeObserver(highlightActiveLine).observe(codeInput);
window.addEventListener('resize', highlightActiveLine);
window.addEventListener('DOMContentLoaded', highlightActiveLine)

// Event-Listener für den "Code Ausführen"-Button
document.getElementById('run-code')!.addEventListener('click', () => {
    stacks = {};
    activeLine = -1;
    highlightActiveLine();
    const code = codeInput.value;
    const lines = code.split('\n');
    for (let line of lines) parseCode(line);
});

document.getElementById('run-line')!.addEventListener('click', runNextLine);

document.getElementById('reset')!.addEventListener('click', () => {
    codeInput.value = "";
    stacks = {};
    renderStacks();
    activeLine = -1;
    highlightActiveLine();
})

