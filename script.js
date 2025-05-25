let playerA = "PLAYER A";
let playerB = "PLAYER B";
let roundsVal;
let minutesVal;
let pointsVal;
let aScore = document.getElementById("pa-points");
let bScore = document.getElementById("pb-points");
let totalMinutes = minutesVal;
let totalTime = totalMinutes * 60 * 1000;
let aPenalties = 0;
let bPenalties = 0;
let running = false;
let lastTime;
let passivityTime = 1 * 60 * 1000;
let passivityLastTime;
let passivityStatusA = 0;
let passivityStatusB = 0;
let issetPriority = false;
let priorityA = false;
let priorityB = false;
let aWins = false;
let bWins = false;
let finished = false;
let selectedButton = null;
let selectedCard = null;
let redCardsCount = 0;
let timer = document.getElementById("timer");
let passTimer = document.getElementById("pass-timer");
let priorityACheck = document.getElementById("priority-a");
let priorityBCheck = document.getElementById("priority-b");
let startStopBtn = document.getElementById("start-stop-button");
let playerSelectionModal = document.getElementById("player-selector");
let confirmPenaltyButton = document.getElementById("confirm-penalty");
let cancelPenaltybutton = document.getElementById("cancel-penalty");
playerSelectionModal.style.display = "none";
cancelPenaltybutton.addEventListener("click", () => {
  playerSelectionModal.style.display = "none";
});
confirmPenaltyButton.addEventListener("click", setPenalty);

document.querySelectorAll(".player-buttons").forEach((button) => {
  button.addEventListener("click", () => {
    if (selectedButton === button) {
      button.classList.remove("selected");
      selectedButton = null;
    } else {
      if (selectedButton) {
        selectedButton.classList.remove("selected");
      }
      button.classList.add("selected");
      selectedButton = button;
    }
  });
});
document.querySelectorAll(".card-btn").forEach((button) => {
  button.addEventListener("click", () => {
    selectedCard = button;
    playerSelectionModal.style.display = "flex";
  });
});
startStopBtn.addEventListener("click", startStop);
document.getElementById("reset-btn").addEventListener("click", function () {
  reset();
  resetCards();
});
document.getElementById("priority-btn").addEventListener("click", function () {
  checkPriority();
});
document.getElementById("modal-conf").addEventListener("click", () => {
  document.querySelector(".modal").style.display = "flex";
});

document.querySelectorAll(".add-btns").forEach((button) => {
  button.addEventListener("click", function () {
    add(this);
  });
});

document.querySelectorAll(".decrease-btns").forEach((button) => {
  button.addEventListener("click", function () {
    decrease(this);
  });
});

document.querySelectorAll(".p-names").forEach((player) => {
  player.addEventListener("click", function () {
    changeNames(this);
  });
});
updateTotalMinutes();
updateTimer();
updatePassivityTimer();

async function changeNames(element) {
  let newName = await customPrompt("Your name");
  let regex = /^[a-zA-Z]+(?: [a-zA-Z]+)?$/;
  const id = element.id;

  if (newName != null && regex.test(newName)) {
    newName = newName.toUpperCase();
    document.getElementById(id).textContent = newName;

    if (id === "pa-name") {
      playerA = newName;
    } else if (id === "pb-name") {
      playerB = newName;
    }
  } else {
    await customAlert("Name field can only contain letters");

    if (id === "pa-name") {
      document.getElementById(id).textContent = "PLAYER A";
      playerA = "PLAYER A";
    } else if (id === "pb-name") {
      document.getElementById(id).textContent = "PLAYER B";
      playerB = "PLAYER B";
    }
  }
}

async function add(btn) {
  const id = btn.id;
  if (issetPriority) {
    running = false;
    toggleStartStopButton();
    if (id === "pa-plus") {
      aScore.textContent++;
      await customAlert(`${playerA} wins`);
      disableClicks(
        "start-stop-button",
        "priority-btn",
        "yellow-penalty",
        "red-penalty",
        "black-penalty",
        "pa-plus",
        "pb-plus",
        "pa-minus",
        "pb-minus"
      );
      await guardarAsalto(
        getUserId(),
        playerA,
        playerB,
        aScore.textContent,
        bScore.textContent,
        playerA
      );
      document.getElementById("to-hide").style.display = "unset";
    } else {
      bScore.textContent++;
      await customAlert(`${playerB} wins`);
      disableClicks(
        "start-stop-button",
        "priority-btn",
        "yellow-penalty",
        "red-penalty",
        "black-penalty",
        "pa-plus",
        "pb-plus",
        "pa-minus",
        "pb-minus"
      );
      await guardarAsalto(
        getUserId(),
        playerA,
        playerB,
        parseInt(aScore.textContent),
        parseInt(bScore.textContent),
        playerB
      );
      document.getElementById("to-hide").style.display = "unset";
    }
  } else {
    resetPassivityTime();
    updatePassivityTimer();
    if (id === "pa-plus") {
      aScore.textContent++;
      if (parseInt(aScore.textContent) == pointsVal) {
        await customAlert(`${playerA} wins`);
        await guardarAsalto(
          getUserId(),
          playerA,
          playerB,
          aScore.textContent,
          bScore.textContent,
          playerA
        );
        disableClicks(
          "start-stop-button",
          "priority-btn",
          "yellow-penalty",
          "red-penalty",
          "black-penalty",
          "pa-plus",
          "pb-plus",
          "pa-minus",
          "pb-minus"
        );
      }
    } else {
      bScore.textContent++;
      if (parseInt(bScore.textContent) == pointsVal) {
        await customAlert(`${playerB} wins`);
        await guardarAsalto(
          getUserId(),
          playerA,
          playerB,
          aScore.textContent,
          bScore.textContent,
          playerB
        );
        disableClicks(
          "start-stop-button",
          "priority-btn",
          "yellow-penalty",
          "red-penalty",
          "black-penalty",
          "pa-plus",
          "pb-plus",
          "pa-minus",
          "pb-minus"
        );
      }
    }
  }
}
function decrease(btn) {
  const id = btn.id;
  if (id === "pa-minus") {
    aScore.textContent <= 0 ? (aScore = 0) : aScore.textContent--;
  } else {
    bScore.textContent <= 0 ? (bScore = 0) : bScore.textContent--;
  }
}

function toggleStartStopButton() {
  if (!running) {
    startStopBtn.textContent = "START";
    startStopBtn.style.height = "15vh";
  } else {
    startStopBtn.textContent = "STOP";
    startStopBtn.style.height = "33vh";
  }
}

async function step(currentTime) {
  if (!totalMinutes) updateTotalMinutes();
  if (!running) return;
  if (!lastTime) lastTime = currentTime;
  const DELTA_TIME = currentTime - lastTime;
  lastTime = currentTime;
  totalTime -= DELTA_TIME;

  if (!passivityLastTime) passivityLastTime = currentTime;
  const passivityDeltaTime = currentTime - passivityLastTime;
  passivityLastTime = currentTime;
  passivityTime -= passivityDeltaTime;

  if (totalTime < 1 * 60 * 1000) timer.style.color = "orange";
  if (totalTime < 0.5 * 60 * 1000) timer.style.color = "#cd2200";

  if (totalTime <= 0) {
    totalTime = 0;
    running = false;
    toggleStartStopButton();
    roundsVal--;
    await isFinished();
    return;
  }

  if (!issetPriority && passivityTime <= 0) {
    passivityTime = 0;
    running = false;
    toggleStartStopButton();
    resetPassivityTime();
    await customAlert("Penalty for passivity for both players");
    changePassivityStatus("playerA", "playerB");
    totalTime += 10;
    document.getElementById("to-hide").style.display = "unset";
  }

  updateTimer();
  updatePassivityTimer();
  requestAnimationFrame(step);
}

function startStop() {
  if (!running) {
    running = true;
    toggleStartStopButton();
    lastTime = performance.now();
    passivityLastTime = performance.now();
    requestAnimationFrame(step);
    document.getElementById("to-hide").style.display = "none";
  } else {
    running = false;
    toggleStartStopButton();
    document.getElementById("to-hide").style.display = "unset";
  }
}

function updateTimer() {
  const minutes = Math.floor(totalTime / 60000);
  const seconds = Math.floor((totalTime / 1000) % 60);

  document.getElementById("timer").textContent = `${minutes
    .toString()
    .padStart(2, "0")} : 
         ${seconds.toString().padStart(2, "0")}`;
}

function updatePassivityTimer() {
  const pMinutes = Math.floor(passivityTime / 60000);
  const pSeconds = Math.floor((passivityTime / 1000) % 60);
  const pMilliseconds = Math.floor(passivityTime % 1000);

  document.getElementById("pass-timer").textContent = `${pMinutes
    .toString()
    .padStart(2, "0")} : 
         ${pSeconds.toString().padStart(2, "0")} : 
         ${pMilliseconds.toString().padStart(3, "0")}`;
}

function reset() {
  totalMinutes = minutesVal;
  totalTime = totalMinutes * (60 * 1000);
  resetPassivityTime();
  updateTimer();
  updatePassivityTimer();
  enableClicks(
    "start-stop-button",
    "priority-btn",
    "yellow-penalty",
    "red-penalty",
    "black-penalty",
    "pa-plus",
    "pb-plus",
    "pa-minus",
    "pb-minus"
  );
  timer.style.color = "white";
  aScore.textContent = 0;
  bScore.textContent = 0;
}

async function changePassivityStatus(...args) {
  for (let id of args) {
    if (id === "playerA") {
      passivityStatusA++;
      setPassivityCards("playerA");
      if (passivityStatusA === 2) {
        bScore.textContent++;
      } else if (passivityStatusA === 3) {
        await customAlert(`${playerA} disqualified, ${playerB} wins`);
      }
    } else if (id === "playerB") {
      passivityStatusB++;
      setPassivityCards("playerB");
      if (passivityStatusB === 2) {
        aScore.textContent++;
      } else if (passivityStatusB === 3) {
        await customAlert(`${playerB} disqualified, ${playerA} wins`);
      }
    } else {
      console.log("Jugador no reconocido");
    }
  }
}

function setPassivityCards(id) {
  let key = "";
  let player = "";
  if (id === "playerA") {
    key = passivityStatusA;
    player = "a";
  } else if (id === "playerB") {
    key = passivityStatusB;
    player = "b";
  } else {
    console.log("Jugador no reconocido");
  }
  switch (key) {
    case 1:
      document.getElementById("yellow-pcard-" + player).style.display = "flex";
      document.getElementById("yellow-card").style.display = "flex";
      document
        .getElementById("yellow-card")
        .addEventListener("click", function () {
          toggleDisplay(this);
        });
      break;
    case 2:
      document.getElementById("red-pcard-" + player).style.display = "flex";
      document.getElementById("red-card").style.display = "flex";
      document
        .getElementById("red-card")
        .addEventListener("click", function () {
          toggleDisplay(this);
        });
      break;
    case 3:
      document.getElementById("black-pcard-" + player).style.display = "flex";
      document.getElementById("black-card").style.display = "flex";
      document
        .getElementById("black-card")
        .addEventListener("click", function () {
          toggleDisplay(this);
        });
      reset();
      break;
    default:
      break;
  }
}

function toggleDisplay(element) {
  id = element.id;
  document.getElementById(id).style.display = "none";
}

function setPriority() {
  let priority = Math.floor(Math.random() * 2);
  if (priority === 0) {
    priorityA = true;
    issetPriority = true;
    updateTotalMinutes();
    updateTimer();
    priorityACheck.style.display = "flex";
  } else if (priority === 1) {
    priorityB = true;
    issetPriority = true;
    updateTotalMinutes();
    updateTimer();
    priorityBCheck.style.display = "flex";
  }
}

function checkPriority() {
  if (issetPriority) {
    priorityA = false;
    priorityB = false;
    issetPriority = false;
    priorityACheck.style.display = "none";
    priorityBCheck.style.display = "none";
  } else {
    setPriority();
  }
}

function updateTotalMinutes() {
  if (issetPriority) {
    totalMinutes = 1;
    totalTime = totalMinutes * (60 * 1000);
  } else {
    totalMinutes = minutesVal;
    totalTime = totalMinutes * (60 * 1000);
  }
}
function resetCards() {
  document.querySelectorAll(".cards").forEach((card) => {
    card.style.display = "none";
  });
  issetPriority = false;
  priorityA = false;
  priorityB = false;
  passivityStatusA = 0;
  passivityStatusB = 0;
}

function penaltiesToPoints(player) {
  switch (player) {
    case "playerA":
      if (aPenalties === 2) {
        bScore.textContent++;
        aPenalties = 0;
        document
          .querySelectorAll("#yellow-card-a, #red-card-a")
          .forEach((card) => {
            card.style.display = "none";
          });
      } else if (aPenalties === 3) {
        bScore.textContent++;
        aPenalties = 1;
        document.querySelectorAll("#red-card-a").forEach((card) => {
          card.style.display = "none";
        });
      }
      break;
    case "playerB":
      if (bPenalties === 2) {
        aScore.textContent++;
        bPenalties = 0;
        document
          .querySelectorAll("#yellow-card-b, #red-card-b")
          .forEach((card) => {
            card.style.display = "none";
          });
      } else if (bPenalties === 3) {
        aScore.textContent++;
        bPenalties = 1;
        document.querySelectorAll("#red-card-b").forEach((card) => {
          card.style.display = "none";
        });
      }
      break;
    default:
      return;
  }
}
function disableClicks(...args) {
  args.forEach((arg) => {
    document.getElementById(arg).style.pointerEvents = "none";
    document.getElementById(arg).style.opacity = "40%";
  });
}

function enableClicks(...args) {
  args.forEach((arg) => {
    document.getElementById(arg).style.pointerEvents = "auto";
    document.getElementById(arg).style.color = "white";
    document.getElementById(arg).style.opacity = "100%";
  });
}

const saveBtn = document.getElementById("save-conf");

document.querySelectorAll(".increase").forEach((button) => {
  button.addEventListener("click", function () {
    const valueEl = this.parentElement.querySelector(".value");
    let value = parseInt(valueEl.textContent, 10);
    if (value < 99) valueEl.textContent = value + 1;
  });
});

document.querySelectorAll(".decrease").forEach((button) => {
  button.addEventListener("click", function () {
    const valueEl = this.parentElement.querySelector(".value");
    let value = parseInt(valueEl.textContent, 10);
    if (value > 1) valueEl.textContent = value - 1;
  });
});

saveBtn.addEventListener("click", () => {
  roundsVal = parseInt(document.getElementById("rounds-val").textContent, 10);
  minutesVal = parseInt(document.getElementById("minutes-val").textContent, 10);
  pointsVal = parseInt(document.getElementById("points-val").textContent, 10);

  localStorage.setItem(
    "config",
    JSON.stringify({
      rounds: roundsVal,
      minutes: minutesVal,
      points: pointsVal,
    })
  );

  document.querySelector(".modal").style.display = "none";

  iniciarAplicacion(roundsVal, minutesVal, pointsVal);
});

function iniciarAplicacion(rounds, minutes, points) {
  console.log(
    `Iniciando con ${rounds} asaltos de ${minutes} minutos y ${points} puntos`
  );
  updateTotalMinutes();
  updateTimer();
}

function checkWinner() {
  if (aScore.textContent > bScore.textContent) {
    aWins = true;
  } else if (aScore.textContent < bScore.textContent) {
    bWins = true;
  } else {
    aWins = false;
    bWins = false;
  }
}

async function isFinished() {
  if (roundsVal <= 0) {
    document.getElementById("to-hide").style.display = "unset";
    checkWinner();
    const puntosA = parseInt(aScore.textContent);
    const puntosB = parseInt(bScore.textContent);
    let ganador = "";

    if (aWins) {
      await customAlert(`Time is up! ${playerA} wins!`);
      ganador = playerA;
    } else if (bWins) {
      await customAlert(`Time is up! ${playerB} wins!`);
      ganador = playerB;
    } else {
      if (issetPriority && priorityA) {
        await customAlert(`Time is up! ${playerA} wins by priority!`);
        ganador = playerA;
      } else if (issetPriority && priorityB) {
        await customAlert(`Time is up! ${playerB} wins by priority!`);
        ganador = playerB;
      } else {
        await customAlert("Tie! Priority will be decided.");
        setPriority();
        totalMinutes = minutesVal;
        resetPassivityTime();
        updatePassivityTimer();
        updateTimer();
        updateTotalMinutes();
        return;
      }
    }

    finished = true;
    disableClicks(
      "start-stop-button",
      "priority-btn",
      "yellow-penalty",
      "red-penalty",
      "black-penalty",
      "pa-plus",
      "pb-plus",
      "pa-minus",
      "pb-minus"
    );
    resetPassivityTime();
    await guardarAsalto(
      getUserId(),
      playerA,
      playerB,
      puntosA,
      puntosB,
      ganador
    );
  } else {
    totalMinutes = minutesVal;
    resetPassivityTime();
    updatePassivityTimer();
    updateTimer();
    updateTotalMinutes();
  }
}

function resetPassivityTime() {
  passivityTime = 1 * 60 * 1000;
}

async function setPenalty() {
  if (selectedCard.classList.contains("yellow-cards")) {
    playerSelectionModal.style.display = "none";
    document.getElementById("yellow-card").style.display = "flex";
    document
      .getElementById("yellow-card")
      .addEventListener("click", function () {
        toggleDisplay(this);
      });
    if (selectedButton.id === "player-a") {
      document.getElementById("yellow-card-a").style.display = "flex";
      aPenalties++;
      penaltiesToPoints("playerA");
      resetSelectedPlayer();
    } else if (selectedButton.id === "player-b") {
      document.getElementById("yellow-card-b").style.display = "flex";
      bPenalties++;
      penaltiesToPoints("playerB");
      resetSelectedPlayer();
    } else {
      return;
    }
  } else if (selectedCard.classList.contains("red-cards")) {
    playerSelectionModal.style.display = "none";
    document.getElementById("red-card").style.display = "flex";
    document.getElementById("red-card").addEventListener("click", function () {
      toggleDisplay(this);
    });
    if (selectedButton.id === "player-a") {
      document.getElementById("red-card-a").style.display = "flex";
      aPenalties += 2;
      penaltiesToPoints("playerA");
      resetSelectedPlayer();
    } else if (selectedButton.id === "player-b") {
      document.getElementById("red-card-b").style.display = "flex";
      bPenalties += 2;
      penaltiesToPoints("playerB");
      resetSelectedPlayer();
    } else {
      return;
    }
  } else if (selectedCard.classList.contains("black-cards")) {
    playerSelectionModal.style.display = "none";
    document.getElementById("black-card").style.display = "flex";
    document
      .getElementById("black-card")
      .addEventListener("click", function () {
        toggleDisplay(this);
        disableClicks(
          "start-stop-button",
          "priority-btn",
          "yellow-penalty",
          "red-penalty",
          "black-penalty"
        );
      });
    if (selectedButton.id === "player-a") {
      document.getElementById("black-pcard-a").style.display = "flex";
      resetSelectedPlayer();
      await customAlert(`${playerA} disqualified, ${playerB} wins`);
      await guardarAsalto(
        getUserId(),
        playerA,
        playerB,
        parseInt(aScore.textContent),
        parseInt(bScore.textContent),
        playerB
      );
    } else if (selectedButton.id === "player-b") {
      document.getElementById("black-pcard-b").style.display = "flex";
      resetSelectedPlayer();
      await customAlert(`${playerB} disqualified, ${playerA} wins`);
      await guardarAsalto(
        getUserId(),
        playerA,
        playerB,
        parseInt(aScore.textContent),
        parseInt(bScore.textContent),
        playerA
      );
    } else {
      return;
    }
  } else {
    return;
  }
}

function resetSelectedPlayer() {
  selectedButton.classList.remove("selected");
  selectedButton = null;
}

function customAlert(message) {
  return new Promise((resolve) => {
    const alertModal = document.getElementById("custom-alert");
    document.getElementById("alert-message").textContent = message;
    alertModal.style.display = "flex";

    const okBtn = document.getElementById("alert-ok");
    okBtn.onclick = () => {
      alertModal.style.display = "none";
      resolve();
    };
  });
}

function customPrompt(message) {
  return new Promise((resolve) => {
    const promptModal = document.getElementById("custom-prompt");
    const input = document.getElementById("prompt-input");
    document.getElementById("prompt-message").textContent = message;
    input.value = "";
    promptModal.style.display = "flex";

    const okBtn = document.getElementById("prompt-ok");
    const cancelBtn = document.getElementById("prompt-cancel");

    okBtn.onclick = () => {
      promptModal.style.display = "none";
      resolve(input.value || null);
    };

    cancelBtn.onclick = () => {
      promptModal.style.display = "none";
      resolve(null);
    };
  });
}
