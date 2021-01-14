// Events received by the server
enum ClientEventNames {
    CreateRoom = "createRoom",
    JoinRoom = "joinRoom",
    PlayersUpdate = "playersUpdate",
    ExtractNumber = "extractNumber",
    ChooseCartella = "chooseCartella",
    UnchooseCartella = "unchooseCartella",
    StartGame = "startGame",
    ChoseAllCartelle = "choseAllCartelle",
    PleaseGiveMeCartelle = "pleaseGiveMeCartelle",
    GiveAllCartelle = "giveAllCartelle",
    Ready = "ready"
}

// Events sent by the server
enum ServerEventNames {
    CreateRoom = "createRoom",
    HostClosed = "hostClosed",
    JoinRoomError = "joinRoomError",
    PlayersUpdate = "playersUpdate",
    JoinRoom = "joinRoom",
    ExtractedNumber = "extractedNumber",
    Progress = "progress",
    EndGame = "endGame",
    ChosenCartella = "chosenCartella",
    UnchosenCartella = "unchosenCartella",
    EveryoneChose = "everyoneChose",
    StartGameError = "startGameError",
    StartingGame = "startingGame",
    GaveMeCartelle = "gaveMeCartelle",
}

export {
    ServerEventNames,
    ClientEventNames
};