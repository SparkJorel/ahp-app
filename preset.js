// Preset problem: choose the best Cameroonian state university.
// All numerical comparisons are illustrative — adjust to your own preferences.

const PRESET_UNIVERSITES = {
  goal: "Choisir la meilleure université d'État au Cameroun",
  criteria: ["Réputation", "Coût de vie", "Filières", "Localisation"],
  alternatives: ["UY1", "UDouala", "UDschang", "UNgaoundéré"],

  criteriaMatrix: [
    [1,    3,   2,   5  ],
    [1/3,  1,   2,   3  ],
    [1/2,  1/2, 1,   2  ],
    [1/5,  1/3, 1/2, 1  ]
  ],

  altMatrices: {
    "Réputation": [
      [1,    2,   3,   3  ],
      [1/2,  1,   2,   2  ],
      [1/3,  1/2, 1,   1  ],
      [1/3,  1/2, 1,   1  ]
    ],
    "Coût de vie": [
      [1,    2,   1/3, 1/2],
      [1/2,  1,   1/4, 1/3],
      [3,    4,   1,   2  ],
      [2,    3,   1/2, 1  ]
    ],
    "Filières": [
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
