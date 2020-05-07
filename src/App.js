import React, { useContext, useReducer, useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import { gameContext, problems, levels } from "./store";
import { Button, Tag } from '@hackplan/uui';
import logo from './logo.svg';
import './index.css';

const App = observer(() => {
  const gameStore = useContext(gameContext);
  const level = gameStore.useLevel()
  const goods = gameStore.useGoods()
  const defaultStates = Object.fromEntries(problems.map((p) => [p.title, 0]))

  const [shared, setShared] = useState(false)
  const counterReducer = (state, action) => {
    switch (action.type) {
      case 'increment':
        return { ...state, [action.title]: state[action.title] + 1 };
      case 'debug':
        return { ...state, [action.title]: state[action.title] + 10 };
      case 'reset':
        return { ...state, [action.title]: 0 };
      default:
        throw new Error();
    }
  }

  const [problemsStates, dispatch] = useReducer(counterReducer, defaultStates)

  useEffect(() => {
    for (const title in problemsStates) {
      if (problemsStates[title] > 0) {
        const problem = problems.find((p)=> p.title === title)
        const targetTime = problem.time * 2
        problem.percent = (problemsStates[problem.title] / targetTime).toFixed(4);
        problem.percentage = Math.min((Math.floor((problem.percent || 0) * 10000) / 100), 100).toFixed(1) + "%"
        if (problemsStates[title] >= targetTime) {
          resetProblemTimer(problem)
          gameStore.solve(problem)
        }
      }
    }
  }, [problemsStates]);

  const resetProblemTimer = (problem) => {
    clearInterval(problem.counting);
    problem.percent = 0
    problem.percentage = 0
    dispatch({
      title: problem.title,
      type: 'reset'
    })
  }

  const shareOnTwitter = () => {
    setShared(true)
    window.open("https://twitter.com/intent/tweet?tw_p=tweetbutton&text=我正在玩麻烦这个游戏：https://mafan.qqsun.xyz/ by @QQSun", "_blank");
  }

  const notSolvable = (problem) => {
    if (problem.take && !problem.take.every((item) => {
      if (item.name === '你拥有的一切') {
        return true
      }
      const stuff = goods.find((g) => g.name === item.name)
      if (stuff && (stuff.number || 1) >= (item.number || 1)) {
        return true
      }
      return false
    })){
      return true
    }
    return false
  }

  const fixProblem = (problem) => {
    if (problemsStates[problem.title] > 0) {
      return
    }
    resetProblemTimer(problem)

    problem.counting = setInterval(() => {
      if (false) {
        dispatch({
          title: problem.title,
          type: 'debug'
        })
      } else{
        dispatch({
          title: problem.title,
          type: 'increment'
        })
      }
    }, 50)
  }

  return <div className="flex flex-col items-center">

    <img src={logo} className="icon m-6" alt="QQ Coin" height="69" width="104" />
    <div className="text-center mb-4 text-gray-600">
      你是 {levels.find((l) => l.level === (level || 0) )['name']}
    </div>
    <div className="text-center mb-4">
      <h4 className="text-sm text-gray-500 mb-2">你拥有</h4>
      {goods.map((stuff) => {
        return <Tag className="bg-blue-700">
          <span>{stuff.name}</span>
          {stuff.number && <span className="ml-1">&times; {stuff.number}</span>}
        </Tag>
      })}
      {goods.length === 0 && <div className="text-sm text-gray-8  00 mb-4">一无所有</div>}
    </div>

    <div className="container max-w-lg mb-4 px-3">
      <h4 className="text-sm text-gray-500 mb-2 text-center">你的麻烦</h4>
      {problems.filter((problem) => {
        if (!problem.level.includes(level)) {
          return false
        }
        if (problem.dismiss && problem.dismiss.some((item) => goods.some((g) => g.name === item) )) {
          return false
        }
        if (problem.require && !problem.require.some((item) => goods.some((g) => g.name === item))) {
          return false
        }
        return true
      }).sort((a, b) => (b.growth ? 1 : 0) - (a.growth ? 1 : 0)).map((problem) => {
        return <div className="relative p-2 px-3 pb-3 bg-white shadow mb-2 rounded" key={problem.title}>
          <div className="flex flex-row items-center">
            <div className="flex flex-col flex-grow">
              <div className="title">{problem.title}</div>
              {problem.take && problem.take.map((item) => <span className="text-sm text-red-600">- {item.name} {item.number && <span>&times; {item.number}</span>}</span> )}
              {problem.gain && problem.gain.map((item) => <span className="text-sm text-green-600">+ {item.name} {item.number && <span>&times; {item.number}</span>}</span> )}
            </div>
            <div>
              <Button disabled={problem.percent > 0 || notSolvable(problem)} className="text-sm text-red-700 border-red-600" onClick={() => fixProblem(problem)}>解决</Button>
            </div>
          </div>
          <div className="absolute w-full" style={{ left: 0, bottom: 0, right: 0}}>
            <div className="absolute progress h-1 bg-green-500" style={{ 'border-radius': '0.25rem', left: 0, bottom: 0, width: (problem.percentage || 0)}}></div>
          </div>
        </div>
      })}

      {!shared && <div className="relative p-2 px-3 mt-3 bg-white shadow mb-2 rounded">
        <div className="flex flex-row items-center">
          <div className="flex flex-col flex-grow">
            <div className="title">将<span className="font-bold text-red-700 mx-1">麻烦</span>分享到 Twitter</div>
          </div>
          <div>
            <Button className="text-sm text-blue-700 border-blue-600" onClick={() => shareOnTwitter()}>分享</Button>
          </div>
        </div>
      </div>}
    </div>



    <div className="text-sm mb-4">
      <a className="px-6 text-gray-500 text-xs" target="_blank" href="https://github.com/untsop/mafan-2020">source code</a>
    </div>

  </div>
})

export default App;