// Preset problem: choose the best Cameroonian state university.
// All numerical comparisons are illustrative — adjust to your own preferences.

const PRESET_UNIVERSITES = {
  goal: "Choisir la meilleure universite d'Etat au Cameroun",
  criteria: ["Reputation", "Cout de vie", "Filieres", "Localisation"],
  alternatives: ["UY1", "UDouala", "UDschang", "UNgaoundere"],

  criteriaMatrix: [
    [1,    3,   2,   5  ],
    [1/3,  1,   2,   3  ],
    [1/2,  1/2, 1,   2  ],
    [1/5,  1/3, 1/2, 1  ]
  ],

  altMatrices: {
    "Reputation": [
      [1,    2,   3,   3  ],
      [1/2,  1,   2,   2  ],
      [1/3,  1/2, 1,   1  ],
      [1/3,  1/2, 1,   1  ]
    ],
    "Cout de vie": [
      [1,    2,   1/3, 1/2],
      [1/2,  1,   1/4, 1/3],
      [3,    4,   1,   2  ],
      [2,    3,   1/2, 1  ]
    ],
    "Filieres": [
      [1,    2,   3,   3  ],
      [1/2,  1,   2,   2  ],
      [1/3,  1/2, 1,   1  ],
      [1/3,  1/2, 1,   1  ]
    ],
    "Localisation": [
      [1,    3,   4,   5  ],
      [1/3,  1,   2,   3  ],
      [1/4,  1/2, 1,   2  ],
      [1/5,  1/3, 1/2, 1  ]
    ]
  }
};

window.PRESET_UNIVERSITES = PRESET_UNIVERSITES;
