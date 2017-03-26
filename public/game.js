document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  const main = document.getElementsByClassName("areaOfGame")[0];
  const plateau = document.getElementsByClassName("plateau")[0];
  let playerHand = [];
  let gameID = 0;
  let pursue = 1;

  newGame();

  function newGame() {
    document.getElementsByClassName("plateau")[0].replaceWith(plateau);
    document.getElementsByClassName("playerScore")[0].getElementsByTagName("p")[0].innerHTML = "0";
    document.getElementsByClassName("botScore")[0].getElementsByTagName("p")[0].innerHTML = "0";
    main.appendChild(createElements("img", null, {
      name: "src",
      value: "images/waiting.gif"
    }, "preview"));

    requests("POST", "http://localhost:3000/game/new", null)

      .then(response => {
        main.getElementsByClassName("preview")[0].remove();
        gameID = response.game_id;
      })
      .then(() => {
        draw(3);
      })
      .then(() => {
        document.getElementsByClassName("cimetiere")[0].getElementsByTagName("p")[0].addEventListener("click", graveyard);
      })
  }

  function draw(number) {
      let jsonBody = JSON.stringify(
          {
              "quantity": number
          }

      );

    requests("POST", `http://localhost:3000/game/${gameID}/draw`, jsonBody)

      .then(response => {
        let handPlayer = document.getElementsByClassName("handplayer")[0];
        let handBot = document.getElementsByClassName("handbot")[0];
        let pioche = document.getElementsByClassName("pioche")[0].getElementsByTagName("p")[0];
        let effectPlayer = document.getElementsByClassName("playerEffect")[0].getElementsByTagName("p")[0];
        let effectBot = document.getElementsByClassName("botEffect")[0].getElementsByTagName("p")[0];
        response.cards.forEach(function (element) {
          let article = createElements("article", null, null, "card");
          let image = createElements("img", null, {
            name: "src",
            value: element.image
          });
          image.id = element.code;
          article.appendChild(image);
          handPlayer.appendChild(article);
          handBot.appendChild(createElements("img", null, {
              name: "src",
              value: "./images/verso_carte.jpg"
            }));
          image.addEventListener("click", eventPreviewingOneCard, false);
          playerHand.push(
                {
                    "cardDescription": element.cardDescription,
                    "hashCode": element.code
                }
            );
        }, this);
        pioche.innerHTML = `Cartes restantes ${response.remaining}`;
        effectPlayer.innerHTML = response.player;
        effectBot.innerHTML = response.bot;
      });
  }

  function createElements(tag, content, attribute, nameClass = "") {
    let element = document.createElement(`${tag}`);

    if (content) {
      element.innerHTML = content;
    }
    if (attribute) {
      element.setAttribute(attribute.name, attribute.value);
    }
    element.className = nameClass;
    return element;
  }

  function requests(method, url, body, parse = true) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      xhr.onload = function () {
        (this.status >= 200 && this.status < 300) ? resolve(parse ? JSON.parse(xhr.response) : xhr.response): reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      body == null ? xhr.send() : xhr.send(body);
    });
  }

  function eventPreviewingOneCard() {
      let preview = document.getElementsByClassName("preview");
      if(preview.length == 0) {
          this.parentNode.className = "preview";
          let hand = document.getElementsByClassName("card");
          let currentDescription;
          for (let element of playerHand) {
              if (element.hashCode == this.id) {
                  currentDescription = element.cardDescription;
              }
          }
          let description = createElements("article", `<p>${currentDescription.description}</p><p>${currentDescription.power_weakness}</p>`, null, "description");
          let disablePreview = createElements("p", currentDescription.action1, null, "disablePreview");
          let playCard = createElements("p", currentDescription.action2, null, "play");
          let allAction = createElements("article", null, null, "action");
          disablePreview.addEventListener("click", eventClosePreviewingOneCard);
          playCard.addEventListener("click", eventPlayOneCard);
          allAction.appendChild(disablePreview);
          allAction.appendChild(playCard);
          this.parentNode.appendChild(description);
          this.parentNode.appendChild(allAction);
      }
  }

  function eventClosePreviewingOneCard() {

      this.parentNode.parentNode.className = "card";
      this.removeEventListener("click", eventClosePreviewingOneCard);
      document.getElementsByClassName("action")[0].remove();
      document.getElementsByClassName("description")[0].remove();
  }

  function eventPlayOneCard() {

      let cardCode = document.getElementsByClassName("preview")[0].getElementsByTagName("img")[0].id;
      let jsonBody = JSON.stringify(
          {
              "hashCode": cardCode
          }

      );

      requests("POST", `http://localhost:3000/game/${gameID}/play`, jsonBody, true)

        .then(response => {
          let cardPlayerPlayed = createElements("img", null, {
            name: "src",
            value: response.player.image
          }, "cardPlayer");
          let cardBotPlayed = createElements("img", null, {
            name: "src",
            value: response.bot.image
          }, "cardBot");
          cardPlayerPlayed.className = "played";
          let areaOfGame = document.getElementsByClassName("areaOfGame")[0];
          this.parentNode.getElementsByClassName("disablePreview")[0].removeEventListener("click", eventClosePreviewingOneCard);
          this.removeEventListener("click", eventPlayOneCard);
          document.getElementsByClassName("preview")[0].remove();
          areaOfGame.appendChild(cardPlayerPlayed);
          areaOfGame.insertBefore(cardBotPlayed, document.getElementsByClassName("cardBot")[0]);
        })

        .then(() => {
          document.getElementsByClassName("handbot")[0].getElementsByTagName("img")[0].remove();
        })

        .then(() => {
          let cardsArticle = document.getElementsByClassName("card");
          for(let article of cardsArticle) {
              let currentArticle = article.getElementsByTagName("img");
              currentArticle[0].removeEventListener("click", eventPreviewingOneCard);
          }
        })

        .then(() => {
          outcome();
        })
  }

  function outcome() {
    let results = {
      result: "",
      playerScore: "",
      botScore: "",
      nextTurn: ""
    };

    requests("POST", `http://localhost:3000/game/${gameID}/outcome`, null, true)

      .then((response) => {
        results.result = response.result;
        results.playerScore = response.score.player;
        results.botScore = response.score.bot;
        results.nextTurn = response.nextTurn;
        pursue = response.pursue;
      })

      .then(() => {
        let areaOfGame = document.getElementsByClassName("areaOfGame")[0];
        let article = createElements("article", results.result, null, "description");
        let next = createElements("p", results.nextTurn, null);
        next.className = results.nextTurn == "Tour suivant" ? "" : "end";
        let action = createElements("article", null, null, "description nexTurn");
        action.appendChild(next);
        let playerScore = document.getElementsByClassName("playerScore")[0];
        let newPlayerScore = createElements("p", (results.playerScore == 0) ? "0" : results.playerScore, null);
        let botScore = document.getElementsByClassName("botScore")[0];
        let newBotScore = createElements("p", (results.botScore == 0) ? "0" : results.botScore, null);
        playerScore.replaceChild(newPlayerScore, playerScore.getElementsByTagName("p")[0]);
        botScore.replaceChild(newBotScore, botScore.getElementsByTagName("p")[0]);
        areaOfGame.appendChild(article);
        areaOfGame.appendChild(action);
      })

      .then(() => {
        document.getElementsByClassName("nexTurn")[0].childNodes[0].addEventListener("click", nextTurn);
      })
  }

  function nextTurn() {

      document.getElementsByClassName("nexTurn")[0].removeEventListener("click", nextTurn);
      let hand = document.getElementsByClassName("handplayer")[0].getElementsByClassName("card");
      for (let element of hand) {
        element.getElementsByTagName("img")[0].addEventListener("click", eventPreviewingOneCard);
      }
      let children = document.getElementsByClassName("areaOfGame")[0].childNodes.length;
        for (let i = 0; i < children; i++) {
          document.getElementsByClassName("areaOfGame")[0].childNodes[0].remove();
        }
      if (pursue == 1) {
        draw(1);
      } else {
        endOfGame();
      }
  }
  
  function graveyard() {
    let cimetiere = document.getElementsByClassName("cimetiere")[0].getElementsByTagName("p")[0];
    let discard = document.getElementsByClassName("discard");
    if(document.getElementsByClassName("preview").length == 0) {
      if(discard.length != 0) {
        cimetiere.innerHTML = "Cliquez ici pour voir la défausse";
        discard[0].remove();
      } else {
        cimetiere.innerHTML = "Cliquez ici pour fermer la défausse";

        requests("POST", `http://localhost:3000/game/${gameID}/graveyard`)

        .then((response) => {
          let figure = createElements("article", null, null, "discard");
          for (let i = 0; i < response.cards.length; i++) {
            figure.appendChild(createElements("img", null, {
              name: "src",
              value: response.cards[i].image
            }));
          }
          document.getElementsByClassName("cimetiere")[0].appendChild(figure);
        })
      }
    }
  }

  function endOfGame() {
    let plateau = document.getElementsByClassName("areaOfGame")[0];
    document.getElementsByClassName("cimetiere")[0].getElementsByTagName("p")[0].removeEventListener("click", graveyard);

    requests("POST", `http://localhost:3000/game/${gameID}/winner`)

    .then((response) => {
      let h1 = createElements("h1", response.winOrLoose, null);
      let replay = createElements("p", response.wannaReplay, null);
      let yesOption = createElements("p", "Oui", null);
      let noOption = createElements("p", "Non", null);
      yesOption.addEventListener("click", nextGame);
      noOption.addEventListener("click", theEnd);
      plateau.appendChild(h1);
      plateau.appendChild(replay);
      plateau.appendChild(yesOption);
      plateau.appendChild(noOption);
    });
  }

  function nextGame() {
    this.removeEventListener("click", nextGame);
    for(let i = 0; i < 4; i++) {
      document.getElementsByClassName("areaOfGame")[0].children[0].remove();
    }
    newGame();
  }

  function theEnd() {
    this.removeEventListener("click", theEnd);
    for(let i = 0; i < 4; i++) {
      document.getElementsByClassName("areaOfGame")[0].children[0].remove();
    }
    let thanksMessage = createElements("h1", "Merci d'avoir joué !! N'hésitez pas à me faire part de vos remarques constructives !", null);
    document.getElementsByClassName("areaOfGame")[0].appendChild(thanksMessage);
  }
});