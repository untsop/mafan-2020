import { createContext } from "react";
import { action, observable } from 'mobx';
import { persist } from 'mobx-persist';
import { useObserver } from 'mobx-react-lite';
import { mafan } from './data'

const updateStuff = (playerGoods, s, isTake) => {
  let number = 0;
  if (isTake) {
    number = -1 * (s.number || 1);
  } else {
    number = s.number || 1;
  }

  const stuffToUpdate = playerGoods.find(stuff => s.name === stuff.name)

  if (stuffToUpdate) {
    if (!stuffToUpdate.number) {
      stuffToUpdate.number = number + 1;
    } else {
      stuffToUpdate.number = stuffToUpdate.number + number;
    }
    if (stuffToUpdate.number === 0) {
      playerGoods.splice(playerGoods.findIndex(stuff => s.name === stuff.name), 1);
    }
  } else {
    playerGoods.push(s);
  }
}

const updateGoods = (player, problem) => {
  if (problem.gain) {
    problem.gain.map((i) => updateStuff(player, i))
  }
  if (problem.take) {
    problem.take.map((i) => updateStuff(player, i, true))
  }
}

export class DataStore {
  @persist @observable level = 0
  @persist('list') @observable goods = []

  @action.bound
  solve(problem) {
    if (problem.dismiss) {
      if (problem.dismiss.some((item) => this.goods.some((g) => g.name === item))) {
        return
      }
    }

    if (problem.take) {
      if (problem.take.some((stuff) => {
        const foundItem = this.goods.find((item) => item.name === stuff.name)
        if (foundItem && (foundItem.number || 1) >= (stuff.number || 1)) {
          return false
        }
        return true
      })) {
        return
      }
    }

    if (problem.reset) {
      this.level = 0;
      this.goods = [];
      return true;
    }
    updateGoods(this.goods, problem);
    if (problem.growth) {
      this.level += 1;
    }
  }

  useLevel = () => useObserver(() => this.level)
  useGoods = () => useObserver(() => this.goods)
}

export const gameStore = new DataStore()
export const problems = mafan.problems
export const levels = mafan.levels

export const gameContext = createContext(gameStore);