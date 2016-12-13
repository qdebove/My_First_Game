var gameID;

function playerDraw(gameNumber, number) {
  $.get("/" + gameNumber + "/playerdraw?quantity=" + number)
    .then(function(response) {
      if(response.remaining >= 0) {
        for (var i = 0; i < response.cards.length; i ++) {
          $("<img>").attr("src", response.cards[i].image).appendTo(".handplayer");
          $(".pioche figure:first-child").find("figcaption").replaceWith("<figcaption>Cartes restantes " + response.remaining + ".</figcaption>");
        }
      }
      $(".score h2:first-child").find("p").replaceWith("<p>" + response.effect + "</p>");
      $(".score h2:nth-child(3)").find("p").replaceWith("<p>" + response.effect + "</p>");
    });
}

function botDraw(gameNumber, number) {
  $.get("/" + gameNumber + "/botdraw?quantity=" + number)
    .then(function(response) {
      if(response.remaining >= 0) {
        for (var i = 0; i < response.cards.length; i ++) {
          $("<img>").attr("src", "images/verso_carte.png").appendTo(".handbot");
          $(".pioche figure:first-child").find("figcaption").replaceWith("<figcaption>Cartes restantes " + response.remaining + ".</figcaption>");
        }
      }
      $(".score h2:nth-child(2)").find("p").replaceWith("<p>" + response.effect + "</p>");
      $(".score h2:last-child").find("p").replaceWith("<p>" + response.effect + "</p>");
    });
}

function preview() {
  $(".handplayer").on("click", "img", function() {
    var codeImg = $(this).attr("src").match(/..(?=.jpg)/gi);
    var $index = $(".handplayer").find("img").index(this);
    var $this = $(".handplayer").find(this);
    $(".handplayer").find("article").detach();
    if ($this.hasClass("preview")) {
        $this.removeClass("preview");
    } else {
      $(".handplayer").find("img").removeClass("preview");
      $this.toggleClass("preview");
      $.get("/" + gameID + "/cardinformation?card=" + codeImg)
        .then(function(response) {
          $(response).toggleClass("preview").appendTo(".handplayer");
        })
        .then(function() {
          play();
        });
      }
    });
  $(".handplayer").on("click", ".preview p:nth-child(2)", function() {
      $(".handplayer").find("img").removeClass("preview");
      $(".handplayer").find("article").detach();
  });
}

function play() {
    $(".handplayer").find("article p:last-child").on("click", function() {
      var codeImg = $(".handplayer img.preview").attr("src").match(/..(?=.jpg)/gi);
      var dataCardBot = $(".handbot").find("img:first-child");
      if ($("main").children().length === 0) {
          $.get("/" + gameID + "/play?card=" + codeImg)
              .then(function(response) {
                if($("img.preview").attr("src") === response.player.image) {
                  $("article.preview").detach();
                  $("img.preview").detach();
                  var imageTagPlayer = $("<img>").attr("src", response.player.image);
                  var imageTagBot = $("<img>").attr("src", response.bot.image);
                  imageTagBot.prependTo("main");
                  imageTagPlayer.appendTo("main");
                } else {
                  console.log("Pour la partie numéro " + gameID + ", le serveur a envoyé une mauvaise carte !");
                }
              })
              .then(function() {
                $(".handbot").find("img:first-child").detach();
              })
              .then(function() {
                $.get("/" + gameID + "/outcome")
                    .then(function(response) {
                      $(response.result).appendTo("main");
                      $(".score h1:first-child").find("p").replaceWith("<p>" + response.score.player + "</p>");
                      $(".score h1:nth-child(2)").find("p").replaceWith("<p>" + response.score.bot + "</p>");
                      $(response.nextTurn).appendTo("main");
                      if(response.nextTurn === "<p>Tour suivant</p>") {
                        nextTurn();
                      } else {
                        endOfGame();
                      }
                    });
              });
      }
  });
}


function nextTurn() {
    $("main p:last-child").on("click", function() {
        $("main").children().detach();
        playerDraw(gameID, 1);
        botDraw(gameID, 1);
    });
}

function endOfGame() {
    $(".handplayer").off("click", "img");
    $(".handplayer").off("click", ".preview p:nth-child(2)");
    $(".pioche figure:nth-child(2)").off("click");
    $("main p:last-child").on("click", function() {
        $("main").children().detach();
        $.get("/" + gameID + "/winner", function(response) {
          $(response).appendTo("main");
        })
          .then(function() {
            $("main").find("p:nth-child(3)").on("click", function() {
              letsplay();
            });
            $("main").find("p:last-child").on("click", function() {
              $("main").children().detach();
              $("<h1>Merci d'avoir joué !! N'hésitez pas à me faire part de vos remarques constructives !</h1>").appendTo("main");
              $("<a>Cliquez içi pour revenir au menu principal</a>").attr("href", "jeux1.html").appendTo("main");
            });
          });
    });
}

function discard() {
    var $piocheFigureChild2 = $(".pioche figure:nth-child(2)");
    var $piocheFigureLastChild = ".pioche figure:last-child";
    $piocheFigureChild2.on("click", function() {
        $piocheFigureChild2.find("p").detach();
        if ($($piocheFigureLastChild).hasClass("discard")) {
            $(".discard").detach();
            $piocheFigureChild2.append("<p>Cliquez ici pour voir la défausse</p>");
        } else {
            $piocheFigureChild2.append("<p>Cliquez ici pour fermer la défausse</p>");
            $("<figure></figure>").addClass("discard").appendTo(".pioche");
            $.get("/" + gameID + "/graveyard")
                .then(function(response) {
                    var cardsReceived = response.cards;
                    for (var i = 0; i < cardsReceived.length; i++) {
                        var currentImage = cardsReceived[i].image;
                        var imageTag = $("<img>").attr("src", currentImage);
                        imageTag.appendTo(".pioche figure:last-child");
                    }
                });
        }
    });
}

function initialize() {
    $("<img>").attr("src", "images/waiting.gif").toggleClass("preview").appendTo("main");
    $.get("/newGame")
        .then(function(response) {
          var $piocheFigure = ".pioche figure";
          $($piocheFigure + ":first-child").find("figcaption").detach();
          $($piocheFigure + ":first-child").append("<figcaption>Cartes restantes " + response.remaining + ".</figcaption>");
          $("main").children().detach();
          $($piocheFigure).find("p").detach();
          $($piocheFigure + ":last-child").append("<p>Cliquez ici pour voir la défausse</p>");
          $(".score h1").children().detach();
          $(".score h2").children().detach();
          $(".handplayer").children().detach();
          $(".handbot").children().detach();
          $(".score h1:first-child").append("<p>" + response.scoreEffect.player.score + "</p>");
          $(".score h1:nth-child(2)").append("<p>" + response.scoreEffect.bot.score + "</p>");
          $(".score h2:nth-child(3)").append("<p>" + response.scoreEffect.player.effect + "</p>");
          $(".score h2:last-child").append("<p>" + response.scoreEffect.bot.effect + "</p>");
          $("main").children().detach();
          gameID = response.game_id;
        })
        .then(function() {
          playerDraw(gameID, 3);
        })
        .then(function() {
          botDraw(gameID, 3);
        })
        .then(preview());
}

function letsplay() {
  $(document).ready(function() {
    'use strict';
    initialize();
    discard();
  });
}

letsplay();
