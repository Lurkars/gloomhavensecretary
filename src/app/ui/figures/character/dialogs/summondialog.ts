import { Component, Input } from "@angular/core";
import { gameManager } from "src/app/game/businesslogic/GameManager";

import { Character } from "src/app/game/model/Character";
import { EntityValueFunction } from "src/app/game/model/Entity";
import { Summon, SummonColor, SummonState } from "src/app/game/model/Summon";

import { DialogComponent } from "src/app/ui/dialog/dialog";

@Component({
  selector: 'ghs-character-summondialog',
  templateUrl: 'summondialog.html',
  styleUrls: [ './summondialog.scss', '../../../dialog/dialog.scss' ]
})
export class CharacterSummonDialog extends DialogComponent {

  @Input() character!: Character;

  summonColors: SummonColor[] = Object.values(SummonColor).filter((summonColor: SummonColor) => summonColor != SummonColor.custom);
  summonColor: SummonColor = SummonColor.blue;


  addSummon(summon: Summon) {
    gameManager.stateManager.before();
    const dead = this.character.summons.find((s: Summon) => s.dead && s.number == summon.number && s.color == summon.color);
    if (dead) {
      gameManager.characterManager.removeSummon(this.character, dead);
    }

    gameManager.characterManager.addSummon(this.character, summon);
    gameManager.stateManager.after();
  }

  disabled(number: number) {
    return this.character.summons.some((summon: Summon) => !summon.dead && summon.number == number && summon.color == this.summonColor);
  }

  pickNumber(number: number) {
    this.close();
    gameManager.stateManager.before();
    let summon: Summon = new Summon(this.character.level, number, this.summonColor);
    this.addSummon(summon);
    gameManager.stateManager.after();
  }

  selectColor(color: SummonColor) {
    this.summonColor = color;
  }

  hasCustom() {
    return this.character.summon && (!this.character.summon.level || this.character.summon?.level <= this.character.level) && !this.character.summons.some((summon: Summon) => !summon.dead && summon.number == 0);
  }

  addCustom() {
    if (this.character.summon && !this.character.summons.some((summon: Summon) => !summon.dead && summon.number == 0)) {
      this.close();
      this.character.summons = this.character.summons.filter((summon: Summon) => summon.number != 0);
      let summon: Summon = new Summon(this.character.level, 0, SummonColor.custom);
      summon.maxHealth = typeof this.character.summon.health == "number" ? this.character.summon.health : EntityValueFunction(this.character.summon.health, this.character.level);
      summon.attack = typeof this.character.summon.attack == "number" ? this.character.summon.attack : EntityValueFunction(this.character.summon.attack, this.character.level);
      summon.movement = typeof this.character.summon.movement == "number" ? this.character.summon.movement : EntityValueFunction(this.character.summon.movement, this.character.level);
      summon.range = typeof this.character.summon.range == "number" ? this.character.summon.range : EntityValueFunction(this.character.summon.range, this.character.level);
      summon.health = summon.maxHealth;
      summon.state = SummonState.true;
      summon.init = false;
      this.addSummon(summon);
    }
  }

}