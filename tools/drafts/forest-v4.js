// черновики Леса после отзыва 2026-10-28 (уже в игре): найдены перебором раскладок — какие наборы вырубки проходят
module.exports = [
 {
  "name": "Три бревна",
  "chapter": "Лес",
  "mode": "Вырубка",
  "wind": 22,
  "dir": [
   1,
   0
  ],
  "duration": 8,
  "cost": {
   "wattle": 2,
   "fence": 3
  },
  "shop": [
   "fence"
  ],
  "logs": 0,
  "inv": {},
  "solutionCuts": [
   [
    5,
    5
   ],
   [
    1,
    7
   ],
   [
    2,
    7
   ]
  ],
  "forest": [
   "0000000000",
   "0000000000",
   "0000000000",
   "0000000000",
   "0000000000",
   "0000110000",
   "0000100000",
   "0110000000",
   "0000000000",
   "0000000000"
  ],
  "fixed": [
   {
    "type": "hut",
    "x": 6,
    "y": 2,
    "rot": 0
   },
   {
    "type": "stack",
    "x": 9,
    "y": 0,
    "rot": 0
   },
   {
    "type": "stack",
    "x": 0,
    "y": 0,
    "rot": 0
   },
   {
    "type": "hut",
    "x": 7,
    "y": 5,
    "rot": 0
   },
   {
    "type": "hut",
    "x": 7,
    "y": 7,
    "rot": 0
   },
   {
    "type": "stack",
    "x": 3,
    "y": 7,
    "rot": 0
   }
  ],
  "solution": [
   {
    "type": "fence",
    "x": 3,
    "y": 2,
    "rot": 1
   }
  ]
 },
 {
  "name": "Улица за рощей",
  "chapter": "Лес",
  "mode": "Вырубка",
  "wind": 24,
  "dir": [
   1,
   0
  ],
  "duration": 8,
  "cost": {
   "wattle": 2,
   "fence": 3
  },
  "shop": [
   "wattle",
   "fence"
  ],
  "logs": 0,
  "inv": {},
  "solutionCuts": [
   [
    5,
    6
   ],
   [
    2,
    7
   ]
  ],
  "forest": [
   "0000000000",
   "0000000000",
   "0000000000",
   "0000000000",
   "0000000000",
   "0001000000",
   "0100010000",
   "0010000000",
   "0000000000",
   "0000000000"
  ],
  "fixed": [
   {
    "type": "hut",
    "x": 4,
    "y": 6,
    "rot": 0
   },
   {
    "type": "hut",
    "x": 6,
    "y": 6,
    "rot": 0
   },
   {
    "type": "hut",
    "x": 8,
    "y": 6,
    "rot": 0
   },
   {
    "type": "stack",
    "x": 0,
    "y": 4,
    "rot": 0
   },
   {
    "type": "rock",
    "x": 9,
    "y": 9,
    "rot": 0
   },
   {
    "type": "stack",
    "x": 0,
    "y": 9,
    "rot": 0
   },
   {
    "type": "hut",
    "x": 6,
    "y": 1,
    "rot": 0
   }
  ],
  "solution": [
   {
    "type": "wattle",
    "x": 4,
    "y": 0,
    "rot": 1
   }
  ]
 },
 {
  "name": "Камни и деревья",
  "chapter": "Лес",
  "mode": "Вырубка",
  "wind": 20,
  "dir": [
   1,
   0
  ],
  "duration": 8,
  "cost": {
   "wattle": 2,
   "fence": 3
  },
  "shop": [
   "wattle",
   "fence"
  ],
  "logs": 0,
  "inv": {},
  "solutionCuts": [
   [
    3,
    1
   ],
   [
    3,
    5
   ]
  ],
  "forest": [
   "0000000000",
   "0001000000",
   "0000000000",
   "0001000000",
   "0001000000",
   "0001000000",
   "0000000000",
   "0000000000",
   "0000000000",
   "0000000000"
  ],
  "fixed": [
   {
    "type": "stack",
    "x": 9,
    "y": 9,
    "rot": 0
   },
   {
    "type": "stack",
    "x": 0,
    "y": 9,
    "rot": 0
   },
   {
    "type": "rock",
    "x": 3,
    "y": 0,
    "rot": 0
   },
   {
    "type": "rock",
    "x": 3,
    "y": 2,
    "rot": 0
   },
   {
    "type": "rock",
    "x": 3,
    "y": 6,
    "rot": 0
   },
   {
    "type": "hut",
    "x": 5,
    "y": 3,
    "rot": 0
   },
   {
    "type": "hut",
    "x": 6,
    "y": 2,
    "rot": 0
   },
   {
    "type": "hut",
    "x": 6,
    "y": 8,
    "rot": 0
   }
  ],
  "solution": [
   {
    "type": "wattle",
    "x": 4,
    "y": 7,
    "rot": 1
   }
  ]
 },
 {
  "name": "Ближний ряд",
  "chapter": "Лес",
  "mode": "Вырубка",
  "wind": 28,
  "dir": [
   1,
   0
  ],
  "duration": 8,
  "cost": {
   "wattle": 2,
   "fence": 3
  },
  "shop": [
   "wattle",
   "fence"
  ],
  "logs": 0,
  "inv": {},
  "forest": [
   "0000000000",
   "0000000000",
   "0000010000",
   "0000110000",
   "0000110000",
   "0000000000",
   "0000000000",
   "0000000000",
   "0000000000",
   "0000000000"
  ],
  "fixed": [
   {
    "type": "hut",
    "x": 6,
    "y": 4,
    "rot": 0
   },
   {
    "type": "hut",
    "x": 6,
    "y": 7,
    "rot": 0
   },
   {
    "type": "stack",
    "x": 9,
    "y": 9,
    "rot": 0
   },
   {
    "type": "rock",
    "x": 0,
    "y": 0,
    "rot": 0
   },
   {
    "type": "stack",
    "x": 9,
    "y": 0,
    "rot": 0
   },
   {
    "type": "stack",
    "x": 1,
    "y": 6,
    "rot": 0
   }
  ],
  "solution": [
   {
    "type": "fence",
    "x": 4,
    "y": 6,
    "rot": 1
   }
  ],
  "solutionCuts": [
   [
    5,
    2
   ],
   [
    5,
    3
   ],
   [
    5,
    4
   ]
  ]
 },
 {
  "name": "Наискосок",
  "chapter": "Лес",
  "mode": "Вырубка",
  "wind": 28,
  "dir": [
   1,
   0
  ],
  "duration": 8,
  "cost": {
   "wattle": 2,
   "fence": 3
  },
  "shop": [
   "wattle",
   "fence"
  ],
  "logs": 0,
  "inv": {},
  "solutionCuts": [
   [
    4,
    0
   ],
   [
    5,
    1
   ]
  ],
  "forest": [
   "0000110000",
   "0000110000",
   "0000000000",
   "0000000000",
   "0000000000",
   "0000000000",
   "0000000000",
   "0000000000",
   "0000000000",
   "0000000000"
  ],
  "fixed": [
   {
    "type": "hut",
    "x": 7,
    "y": 0,
    "rot": 0
   },
   {
    "type": "hut",
    "x": 6,
    "y": 7,
    "rot": 0
   },
   {
    "type": "stack",
    "x": 9,
    "y": 9,
    "rot": 0
   },
   {
    "type": "rock",
    "x": 0,
    "y": 0,
    "rot": 0
   },
   {
    "type": "stack",
    "x": 9,
    "y": 0,
    "rot": 0
   },
   {
    "type": "stack",
    "x": 1,
    "y": 6,
    "rot": 0
   }
  ],
  "solution": [
   {
    "type": "wattle",
    "x": 4,
    "y": 6,
    "rot": 1
   }
  ]
 },
 {
  "name": "Подкова",
  "chapter": "Лес",
  "mode": "Вырубка",
  "wind": 26,
  "dir": [
   1,
   0
  ],
  "duration": 8,
  "cost": {
   "wattle": 2,
   "fence": 3
  },
  "shop": [
   "wattle",
   "fence"
  ],
  "logs": 0,
  "inv": {},
  "forest": [
   "0000000000",
   "0000000000",
   "0000110000",
   "0000100000",
   "0000110000",
   "0000000000",
   "0000000000",
   "0000000000",
   "0000000000",
   "0000000000"
  ],
  "fixed": [
   {
    "type": "hut",
    "x": 6,
    "y": 4,
    "rot": 0
   },
   {
    "type": "hut",
    "x": 6,
    "y": 7,
    "rot": 0
   },
   {
    "type": "stack",
    "x": 9,
    "y": 9,
    "rot": 0
   },
   {
    "type": "rock",
    "x": 0,
    "y": 0,
    "rot": 0
   },
   {
    "type": "stack",
    "x": 9,
    "y": 0,
    "rot": 0
   },
   {
    "type": "stack",
    "x": 1,
    "y": 6,
    "rot": 0
   }
  ],
  "solution": [
   {
    "type": "fence",
    "x": 4,
    "y": 6,
    "rot": 1
   }
  ],
  "solutionCuts": [
   [
    4,
    2
   ],
   [
    5,
    2
   ],
   [
    5,
    4
   ]
  ]
 },
 {
  "name": "Край заслона",
  "chapter": "Лес",
  "mode": "Вырубка",
  "wind": 23,
  "dir": [
   1,
   0
  ],
  "duration": 8,
  "cost": {
   "wattle": 2,
   "fence": 3
  },
  "shop": [
   "wattle",
   "fence"
  ],
  "logs": 0,
  "inv": {},
  "solutionCuts": [
   [
    3,
    0
   ],
   [
    3,
    6
   ]
  ],
  "forest": [
   "0001000000",
   "0000000000",
   "0000000000",
   "0001000000",
   "0001000000",
   "0000000000",
   "0001000000",
   "0000000000",
   "0000000000",
   "0000000000"
  ],
  "fixed": [
   {
    "type": "stack",
    "x": 9,
    "y": 9,
    "rot": 0
   },
   {
    "type": "stack",
    "x": 0,
    "y": 9,
    "rot": 0
   },
   {
    "type": "rock",
    "x": 3,
    "y": 1,
    "rot": 0
   },
   {
    "type": "rock",
    "x": 3,
    "y": 2,
    "rot": 0
   },
   {
    "type": "rock",
    "x": 3,
    "y": 5,
    "rot": 0
   },
   {
    "type": "hut",
    "x": 6,
    "y": 0,
    "rot": 0
   },
   {
    "type": "hut",
    "x": 5,
    "y": 4,
    "rot": 0
   },
   {
    "type": "hut",
    "x": 6,
    "y": 8,
    "rot": 0
   }
  ],
  "solution": [
   {
    "type": "wattle",
    "x": 4,
    "y": 7,
    "rot": 1
   }
  ]
 },
 {
  "name": "Дыра в заслоне",
  "chapter": "Лес",
  "mode": "Вырубка",
  "wind": 22,
  "dir": [
   1,
   0
  ],
  "duration": 8,
  "cost": {
   "wattle": 2,
   "fence": 3
  },
  "shop": [
   "wattle",
   "fence"
  ],
  "logs": 0,
  "inv": {},
  "solutionCuts": [
   [
    3,
    3
   ],
   [
    3,
    4
   ]
  ],
  "forest": [
   "0000000000",
   "0001000000",
   "0000000000",
   "0001000000",
   "0001000000",
   "0001000000",
   "0000000000",
   "0000000000",
   "0000000000",
   "0000000000"
  ],
  "fixed": [
   {
    "type": "stack",
    "x": 9,
    "y": 9,
    "rot": 0
   },
   {
    "type": "stack",
    "x": 0,
    "y": 9,
    "rot": 0
   },
   {
    "type": "rock",
    "x": 3,
    "y": 0,
    "rot": 0
   },
   {
    "type": "rock",
    "x": 3,
    "y": 2,
    "rot": 0
   },
   {
    "type": "rock",
    "x": 3,
    "y": 6,
    "rot": 0
   },
   {
    "type": "hut",
    "x": 6,
    "y": 1,
    "rot": 0
   },
   {
    "type": "hut",
    "x": 5,
    "y": 6,
    "rot": 0
   },
   {
    "type": "hut",
    "x": 6,
    "y": 8,
    "rot": 0
   }
  ],
  "solution": [
   {
    "type": "wattle",
    "x": 4,
    "y": 7,
    "rot": 1
   }
  ]
 }
];
