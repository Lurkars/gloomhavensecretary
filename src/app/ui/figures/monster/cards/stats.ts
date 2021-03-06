import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { GameManager, gameManager } from 'src/app/game/businesslogic/GameManager';
import { SettingsManager, settingsManager } from 'src/app/game/businesslogic/SettingsManager';
import { Ability } from 'src/app/game/model/Ability';
import { EntityValueFunction } from 'src/app/game/model/Entity';
import { FigureError } from 'src/app/game/model/FigureError';
import { Monster } from 'src/app/game/model/Monster';
import { MonsterEntity } from 'src/app/game/model/MonsterEntity';
import { MonsterStat } from 'src/app/game/model/MonsterStat';
import { MonsterType } from 'src/app/game/model/MonsterType';
import { DialogComponent } from 'src/app/ui/dialog/dialog';
import { PopupComponent } from 'src/app/ui/popup/popup';

@Component({
  selector: 'ghs-monster-stats',
  templateUrl: './stats.html',
  styleUrls: [ './stats.scss', '../../../dialog/dialog.scss' ]
})
export class MonsterStatsComponent extends DialogComponent {

  @Input() monster!: Monster;
  @Input() showName: boolean = false;
  @Input() forceStats: boolean = false;
  MonsterType = MonsterType;

  stats: MonsterStat | undefined = undefined;
  eliteStats: MonsterStat | undefined = undefined;
  statOverview: boolean = false;

  @ViewChild('normalButton', { read: ElementRef }) normalButton!: ElementRef;
  @ViewChild('eliteButton', { read: ElementRef }) eliteButton!: ElementRef;

  levels: number[] = [ 0, 1, 2, 3, 4, 5, 6, 7 ];

  override ngOnInit(): void {
    super.ngOnInit();
    this.setStats();
  }

  hideStats(type: MonsterType) {
    return !this.forceStats && settingsManager.settings.hideStats && this.monster.entities.every((monsterEntity: MonsterEntity) => monsterEntity.dead || monsterEntity.type != type);
  }

  setStats() {
    if (this.monster.boss) {
      const stats = this.monster.stats.find((monsterStat: MonsterStat) => {
        return monsterStat.level == this.monster.level && monsterStat.type == MonsterType.boss;
      });
      if (!stats) {
        console.error("Could not find '" + MonsterType.boss + "' stats for monster: " + this.monster.name + " level: " + this.monster.level);
        if (this.monster.errors.indexOf(FigureError.stat) == -1) {
          this.monster.errors.push(FigureError.stat);
        }
      }

      this.stats = stats;
    } else {
      const stats = this.monster.stats.find((monsterStat: MonsterStat) => {
        return monsterStat.level == this.monster.level && monsterStat.type == MonsterType.normal;
      });
      if (!stats) {
        console.error("Could not find '" + MonsterType.normal + "' stats for monster: " + this.monster.name + " level: " + this.monster.level);
        if (this.monster.errors.indexOf(FigureError.stat) == -1) {
          this.monster.errors.push(FigureError.stat);
        }
      }

      const eliteStats = this.monster.stats.find((monsterStat: MonsterStat) => {
        return monsterStat.level == this.monster.level && monsterStat.type == MonsterType.elite;
      });
      if (!eliteStats) {
        console.error("Could not find '" + MonsterType.elite + "' stats for monster: " + this.monster.name + " level: " + this.monster.level);
        if (this.monster.errors.indexOf(FigureError.stat) == -1) {
          this.monster.errors.push(FigureError.stat);
        }
      }

      this.stats = stats;
      this.eliteStats = eliteStats;
    }
  }

  statsForType(type: MonsterType): MonsterStat {
    const stat = this.monster.stats.find((monsterStat: MonsterStat) => {
      return monsterStat.level == this.monster.level && monsterStat.type == type;
    });
    if (!stat) {
      console.error("Could not find '" + type + "' stats for monster: " + this.monster.name + " level: " + this.monster.level);
      if (this.monster.errors.indexOf(FigureError.stat) == -1) {
        this.monster.errors.push(FigureError.stat);
      }
      return new MonsterStat(type, this.monster.level, 0, 0, 0, 0);
    }
    return stat;
  }

  addMonsterEntity(number: number, type: MonsterType) {
    gameManager.stateManager.before();
    let parent: ElementRef | undefined = undefined;

    if (type == MonsterType.normal) {
      parent = this.normalButton;
    } else if (type == MonsterType.elite) {
      parent = this.eliteButton;
    }
    gameManager.stateManager.after();
  }

  setLevel(value: number) {
    if (value != this.monster.level) {
      gameManager.stateManager.before();
      const abilities = gameManager.abilities(this.monster);
      if (this.monster.abilities.length != abilities.filter((ability: Ability) => !ability.level || isNaN(+ability.level) || ability.level <= value).length) {
        this.monster.abilities = abilities.filter((ability: Ability) => !ability.level || isNaN(+ability.level) || ability.level <= value).map((ability: Ability, index: number) => index);
        gameManager.monsterManager.shuffleAbilities(this.monster);
      }

      this.monster.level = value;

      this.setStats();
      this.monster.entities.forEach((monsterEntity: MonsterEntity) => {
        let stat = this.stats;
        if (monsterEntity.type == MonsterType.elite) {
          stat = this.eliteStats;
        }

        if (stat == undefined) {
          console.error("Could not find '" + monsterEntity.type + "' stats for monster: " + this.monster.name + " level: " + this.monster.level);
          stat = new MonsterStat(monsterEntity.type, this.monster.level, 0, 0, 0, 0);
          if (this.monster.errors.indexOf(FigureError.stat) == -1) {
            this.monster.errors.push(FigureError.stat);
          }
        }

        monsterEntity.level = this.monster.level;

        let maxHealth: number;
        if (typeof stat.health === "number") {
          maxHealth = stat.health;
        } else {
          maxHealth = EntityValueFunction(stat.health);
        }

        if (monsterEntity.health == monsterEntity.maxHealth) {
          monsterEntity.health = maxHealth;
        }

        monsterEntity.maxHealth = maxHealth;
        if (monsterEntity.health > monsterEntity.maxHealth) {
          monsterEntity.health = monsterEntity.maxHealth;
        }
      });
      gameManager.stateManager.after();
    }
  }

  getEdition(): string {
    return gameManager.getEdition(this.monster);
  }

  override close(): void {
    super.close();
    this.statOverview = false;
  }

}

@Component({
  selector: 'ghs-monster-stats-popup',
  templateUrl: './statspopup.html',
  styleUrls: [ './statspopup.scss', '../../../popup/popup.scss' ]
})
export class MonsterStatsPopupComponent extends PopupComponent {

  @Input() monster!: Monster;

  levels: number[] = [ 0, 1, 2, 3, 4, 5, 6, 7 ];

  getEdition(): string {
    return gameManager.getEdition(this.monster);
  }

  getMonsterForLevel(level: number): Monster {
    let monster: Monster = new Monster(this.monster);
    monster.level = level;
    return monster;
  }
}