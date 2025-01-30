const cards = [
    { name: "oviraptor", img: "/img/SouleatingOviraptor-WISU-EN-R-1E.webp", max: 3 },
    { name: "miscellaneousaurus", img: "/img/Miscellaneousaurus-WISU-EN-R-1E.webp", max: 3 },
    { name: "babycerasaurus", img: "/img/Babycerasaurus-WISU-EN-R-1E.webp", max: 3 },
    { name: "petiteranodon", img: "/img/Petiteranodon-WISU-EN-R-1E.webp", max: 3 },
    { name: "lost_world", img: "/img/LostWorld-WISU-EN-R-1E.webp", max: 3 },
    { name: "scrap_raptor", img: "/img/ScrapRaptor-LIOV-EN-C-1E.webp", max: 3 },
    { name: "fossil_dig", img: "/img/FossilDig-WISU-EN-R-1E.webp", max: 3 },
    { name: "animadorned_archosaur", img: "/img/AnimadornedArchosaur-WISU-EN-R-1E.webp", max: 2 }
];

const motors = {
    1: ["oviraptor", "miscellaneousaurus", "babycerasaurus", "petiteranodon"],
    2: ["lost_world", "scrap_raptor"],
    3: ["lost_world", "babycerasaurus", "petiteranodon", "oviraptor"],
    4: ["lost_world", "animadorned_archosaur"],
    5: ["oviraptor", "babycerasaurus", "petiteranodon"],
    6: ["oviraptor", "fossil_dig"],
    7: ["oviraptor", "lost_world"],
    8: ["animadorned_archosaur", "babycerasaurus", "petiteranodon"],
    9: ["miscellaneousaurus", "oviraptor"]
};

// Carga las descripciones de motores desde el JSON
let motorDescriptions = {};

async function loadMotorDescriptions() {
    try {
        let response = await fetch("data/motors.json");  // Carga el JSON
        motorDescriptions = await response.json();  // Convierte en objeto JS
    } catch (error) {
        console.error("Error al cargar las descripciones:", error);
    }
}

// Muestra la descripción de un motor en la página
function showMotor(motor) {
    let motorInfo = document.getElementById("motor-info");
    motorInfo.innerHTML = `<strong>Motor ${motor}:</strong><br>${motorDescriptions[motor] || "Descripción no disponible."}`;
    motorInfo.classList.remove("hidden");
}

// Carga las descripciones cuando se inicie la página
document.addEventListener("DOMContentLoaded", loadMotorDescriptions);


let selectedCards = {};

// Genera el grid de cartas en la página
function generateCardGrid() {
    const container = document.getElementById("card-container");
    container.innerHTML = "";

    cards.forEach(card => {
        selectedCards[card.name] = 0;

        let cardElement = document.createElement("div");
        cardElement.classList.add("relative", "card");
        cardElement.innerHTML = `
            <img src="${card.img}" alt="${card.name}">
            <div class="counter hidden" id="counter-${card.name}">0</div>
        `;

        cardElement.addEventListener("click", () => toggleCardSelection(card.name, card.max));
        container.appendChild(cardElement);
    });
}

// Agrega animación y contador al seleccionar cartas
function toggleCardSelection(cardName, maxCopies) {
    let counter = document.getElementById(`counter-${cardName}`);

    if (selectedCards[cardName] < maxCopies) {
        selectedCards[cardName]++;
    } else {
        selectedCards[cardName] = 0;
    }

    counter.innerText = selectedCards[cardName];
    counter.classList.toggle("hidden", selectedCards[cardName] === 0);
    counter.classList.add("pop-animation");
}

// Verifica qué motores se pueden activar y considera Fossil Dig solo para dinosaurios
function canActivateMotor(selected) {
    let fossilCount = selectedCards["fossil_dig"] || 0;

    return Object.entries(motors).filter(([key, motorCards]) => {
        let missingCards = motorCards.filter(card => !selected.includes(card));

        // Separa los dinosaurios faltantes y las magias faltantes
        let missingDinos = missingCards.filter(card => ["oviraptor", "miscellaneousaurus", "babycerasaurus", "petiteranodon", "scrap_raptor", "animadorned_archosaur"].includes(card));
        let missingSpells = missingCards.filter(card => ["lost_world"].includes(card));

        // Considera que Babycerasaurus y Petiteranodon son equivalentes
        if (missingDinos.includes("babycerasaurus") || missingDinos.includes("petiteranodon")) {
            missingDinos = missingDinos.filter(card => card !== "babycerasaurus" && card !== "petiteranodon");
            if (!selected.includes("babycerasaurus") && !selected.includes("petiteranodon")) {
                missingDinos.push("babycerasaurus_or_petiteranodon");
            }
        }

        // Oviraptor puede traer a Miscellaneousaurus a la mano
        if (missingDinos.includes("miscellaneousaurus") && selected.includes("oviraptor")) {
            missingDinos = missingDinos.filter(card => card !== "miscellaneousaurus");
        }

        // Miscellaneousaurus también reemplaza a Oviraptor en el motor 1
        if (key === "1") {
            if (missingDinos.includes("oviraptor") && selected.includes("miscellaneousaurus")) {
                missingDinos = missingDinos.filter(card => card !== "oviraptor");
            }
        }

// En el motor 3, se necesita 1 Lost World, 1 Oviraptor o Miscellaneousaurus, y 1 Babycerasaurus o Petiteranodon
if (key === "3") {
    if (!selected.includes("lost_world")) {
        return false; // Si falta Lost World, el motor no se puede activar
    }

    let hasOviOrMisc = selected.includes("oviraptor") || selected.includes("miscellaneousaurus");
    let hasBabyOrPeti = selected.includes("babycerasaurus") || selected.includes("petiteranodon");

    // Fossil Dig puede reemplazar un segmento si falta
    let missingSegments = 0;
    if (!hasOviOrMisc) missingSegments++; // Falta Ovi o Miscella
    if (!hasBabyOrPeti) missingSegments++; // Falta Baby o Peti

    // Verificamos si Fossil Dig puede cubrir los segmentos faltantes
    if (fossilCount >= missingSegments) {
        return true; // Fossil Dig puede reemplazar lo que falta
    }

    // Si falta algún segmento y no hay suficiente Fossil Dig, el motor no se puede activar
    return false;
}


 // En el motor 8, Fossil Dig puede reemplazar a Animadorned Archosaur, Babycerasaurus o Petiteranodon
 if (key === "8") {
    let requiredDinos = ["animadorned_archosaur", "babycerasaurus", "petiteranodon"];
    let missingRequiredDinos = missingDinos.filter(card => requiredDinos.includes(card));
    let fossilReplacements = Math.min(fossilCount, missingRequiredDinos.length);
    missingDinos = missingDinos.filter(card => !requiredDinos.includes(card) || fossilReplacements-- <= 0);
} else {
    // Limita Fossil Dig para que solo reemplace hasta la cantidad exacta de dinosaurios faltantes
    let fossilReplacements = Math.min(fossilCount, missingDinos.length);
    missingDinos = missingDinos.slice(fossilReplacements);
}

        // Limita Fossil Dig para que solo reemplace hasta la cantidad exacta de dinosaurios faltantes
        let fossilReplacements = Math.min(fossilCount, missingDinos.length);
        missingDinos = missingDinos.slice(fossilReplacements);

        // Fossil Dig solo reemplaza dinosaurios, no Lost World ni otras magias
        return missingDinos.length === 0 && missingSpells.length === 0;
    }).map(([key]) => key);
}

// Verifica motores activables y muestra los resultados
function checkMotors() {
    let selected = Object.keys(selectedCards).filter(card => selectedCards[card] > 0);
    let activeMotors = canActivateMotor(selected);

    let resultDiv = document.getElementById("result");
    resultDiv.classList.add("fade-in");

    if (activeMotors.length > 0) {
        resultDiv.innerHTML = `✅ <span class="text-green-600">Motores Activos:</span> <br>` +
            activeMotors.map(key => `<span class="motor-clickable" onclick="showMotor(${key})">Motor ${key}</span>`).join(", ");
    } else {
        resultDiv.innerHTML = `<span class="text-red-500">❌ No puedes activar ningún motor.</span>`;
    }
}

// Limpia la selección y resetea las cartas
function resetSelection() {
    selectedCards = {};
    generateCardGrid();
    document.getElementById("result").innerHTML = "";
    document.getElementById("motor-info").classList.add("hidden");
}

// Muestra la descripción del motor en la página
function showMotor(motor) {
    let motorInfo = document.getElementById("motor-info");
    motorInfo.innerHTML = `<strong>Motor ${motor}:</strong> ${motorDescriptions[motor]}`;
    motorInfo.classList.remove("hidden");
}

// Inicializa el grid de cartas al cargar la página
document.addEventListener("DOMContentLoaded", generateCardGrid);
