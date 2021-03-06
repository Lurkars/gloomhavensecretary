import { Component, } from "@angular/core";
import { GameManager, gameManager } from "src/app/game/businesslogic/GameManager";
import { settingsManager, SettingsManager } from "src/app/game/businesslogic/SettingsManager";
import { Character } from "src/app/game/model/Character";
import { Figure } from "src/app/game/model/Figure";
import { Monster } from "src/app/game/model/Monster";
import { FigureIdentifier, Permissions } from "src/app/game/model/Permissions";

@Component({
  selector: 'ghs-server-menu',
  templateUrl: 'server.html',
  styleUrls: [ 'server.scss', '../menu.scss' ]
})
export class ServerMenuComponent {

  gameManager: GameManager = gameManager;
  settingsManager: SettingsManager = settingsManager;

  tryConnect: boolean = false;

  WebSocket = WebSocket;

  permissions: Permissions | undefined = new Permissions();
  password: string = '';

  connect(url: string, port: string, password: string): void {
    if (url && !isNaN(+port) && password) {
      settingsManager.setServer(url, +port, password);
      gameManager.stateManager.connect();
      this.tryConnect = true;
    }
  }

  getPermissions() {
    if (gameManager.stateManager.permissions) {
      this.permissions = gameManager.stateManager.permissions;
    }
    return this.permissions;
  }

  disconnect() {
    gameManager.stateManager.disconnect();
    this.permissions = gameManager.stateManager.permissions;
  }

  setServerUrl(event: any) {
    this.tryConnect = false;
    settingsManager.settings.serverUrl = event.target.value;
    settingsManager.storeSettings();
  }

  setServerPort(event: any) {
    this.tryConnect = false;
    settingsManager.settings.serverPort = event.target.value;
    settingsManager.storeSettings();
  }

  setServerPassword(event: any) {
    this.tryConnect = false;
    settingsManager.settings.serverPassword = event.target.value;
    settingsManager.storeSettings();
  }

  permissionsAll(event: any) {
    if (event.target.checked) {
      this.permissions = undefined;
    } else {
      this.permissions = new Permissions();
    }
  }

  permissionsCustom(event: any) {
    if (event.target.checked) {
      this.permissions = new Permissions();
    } else {
      this.permissions = undefined;
    }
  }

  characters(): Character[] {
    return gameManager.game.figures.filter((figure: Figure) => figure instanceof Character).map((figure: Figure) => figure as Character);
  }

  hasCharacter(character: Character): boolean {
    return this.permissions != undefined && this.permissions.character.some((value: FigureIdentifier) => value.name == character.name && value.edition == character.edition);
  }

  toggleCharacter(character: Character) {
    if (this.permissions) {
      const value: FigureIdentifier | undefined = this.permissions.character.find((value: FigureIdentifier) => value.name == character.name && value.edition == character.edition);
      if (value) {
        this.permissions.character.splice(this.permissions.character.indexOf(value, 1));
      } else {
        this.permissions.character.push(new FigureIdentifier(character.name, character.edition));
      }
    }
  }

  monsters(): Monster[] {
    return gameManager.game.figures.filter((figure: Figure) => figure instanceof Monster).map((figure: Figure) => figure as Monster);
  }

  hasMonster(monster: Monster): boolean {
    return this.permissions != undefined && this.permissions.monster.some((value: FigureIdentifier) => value.name == monster.name && value.edition == monster.edition);
  }

  toggleMonster(monster: Monster) {
    if (this.permissions) {
      const value: FigureIdentifier | undefined = this.permissions.monster.find((value: FigureIdentifier) => value.name == monster.name && value.edition == monster.edition);
      if (value) {
        this.permissions.monster.splice(this.permissions.monster.indexOf(value, 1));
      } else {
        this.permissions.monster.push(new FigureIdentifier(monster.name, monster.edition));
      }
    }
  }

  setPermissionsPassword(event: any) {
    this.password = event.target.value;
  }

  savePermissions() {
    gameManager.stateManager.savePermissions(this.password, this.permissions);
    this.password = '';
    this.permissions = new Permissions();
  }
}