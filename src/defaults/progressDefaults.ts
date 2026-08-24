export const defaultProgressionData = {
  ProgressData: {
    Prologue: {
      Completed: false,
      Unlocked: true,
      Tutorial: {
        Completed: false,
        Unlocked: true,
        Chapters: [
          {
            Completed: false,
            Unlocked: true,
            Console: false,
          },
          {
            Completed: false,
            Unlocked: false,
            Console: false,
          },
        ],
      },
      Action: {
        Completed: false,
        Unlocked: false,
        Chapters: [
          {
            Completed: false,
            Unlocked: false,
            Console: false,
            TimeRemaining: 3600,
          },
        ],
      },
    },
    Episode_01: {
      Completed: false,
      Unlocked: false,
      Story: {
        Completed: false,
        Unlocked: false,
        Chapters: [
          { Completed: false, Unlocked: false, Console: false },
          { Completed: false, Unlocked: false, Console: false },
          { Completed: false, Unlocked: false, Console: false },
          { Completed: false, Unlocked: false, Console: false },
        ],
      },
      Mission: {
        Completed: false,
        Unlocked: false,
        Chapters: [
          { Completed: false, Unlocked: false, Console: false },
          { Completed: false, Unlocked: false, Console: false },
          { Completed: false, Unlocked: false, Console: false },
        ],
      },
    },
    Episode_02: {
      Completed: false,
      Unlocked: false,
      Story: {
        Completed: false,
        Unlocked: false,
        Chapters: [
          { Completed: false, Unlocked: false, Console: false },
          { Completed: false, Unlocked: false, Console: false },
          { Completed: false, Unlocked: false, Console: false },
          { Completed: false, Unlocked: false, Console: false },
        ],
      },
      Mission: {
        Completed: false,
        Unlocked: false,
        Chapters: [
          { Completed: false, Unlocked: false, Console: false },
          { Completed: false, Unlocked: false, Console: false },
          { Completed: false, Unlocked: false, Console: false },
        ],
      },
    },
    Episode_03: {
      Completed: false,
      Unlocked: false,
    },
    Episode_04: {
      Completed: false,
      Unlocked: false,
    },
    Store: {
      Unlocked: false,
    },
    Repair: {
      Unlocked: false,
    },
    Options: {
      Unlocked: true,
    },
    Play: {
      Unlocked: true,
    },
  },
};

export const defaultEquippedData = {
  Equipped: {
    CowCatcher: false,
    MiniGun: false,
    Cannon: false,
    SonicWeapon: false,
    MissileLauncher: false,
    Decal: "None",
    Engine: "Default",
  },
};

export const defaultStoreProgressData = {
  StoreProgress: {
    ModPoints: {
      Owned: 0,
      Spent: 0,
    },
    Weapons: {
      CowCatcher: {
        CurrentTier: 0,
        AvailableTier: 0,
        MaxTier: 1,
      },
      MiniGun: {
        CurrentTier: 0,
        AvailableTier: 0,
        MaxTier: 3,
      },
      Cannon: {
        CurrentTier: 0,
        AvailableTier: 0,
        MaxTier: 2,
      },
      SonicWeapon: {
        CurrentTier: 0,
        AvailableTier: 0,
        MaxTier: 2,
      },
      MissileLauncher: {
        CurrentTier: 0,
        AvailableTier: 0,
        MaxTier: 0,
      },
    },
    Vehicle: {
      Slots: {
        Current: 2,
        Available: 2,
        Max: 5,
      },
    },
    Decals: {
      BlackFlames: { Visible: false, Available: false, Purchased: false },
      BlackSkull: { Visible: false, Available: false, Purchased: false },
      Paramedic: { Visible: false, Available: false, Purchased: false },
      RedFlames: { Visible: false, Available: false, Purchased: false },
      Spider: { Visible: false, Available: false, Purchased: false },
      WhiteSkull: { Visible: false, Available: false, Purchased: false },
    },
    Engine: {
      Engine1: { Visible: false, Available: false, Purchased: false },
      Engine2: { Visible: false, Available: false, Purchased: false },
    },
    VI: {
      CuddlyBearHeadMale: {
        Visible: false,
        Available: false,
        Purchased: false,
      },
      CuddlyBearHeadFemale: {
        Visible: false,
        Available: false,
        Purchased: false,
      },
      SpareParts: { Visible: false, Available: false, Purchased: false },
      HealthPickUp: { Visible: false, Available: false, Purchased: false },
      AmmoPickUp: { Visible: false, Available: false, Purchased: false },
      MountedCuddlyBearHead: {
        Visible: false,
        Available: false,
        Purchased: false,
      },
      RagingUnicornsPoster: {
        Visible: false,
        Available: false,
        Purchased: false,
      },
      CuddlyBearPoster: { Visible: false, Available: false, Purchased: false },
      HeavyWaterPoster: { Visible: false, Available: false, Purchased: false },
      BareCuddlyBearRug: { Visible: false, Available: false, Purchased: false },
      CuddlyBearRug: { Visible: false, Available: false, Purchased: false },
      BareCuddlyBearChair: {
        Visible: false,
        Available: false,
        Purchased: false,
      },
      CuddlyBearChair: { Visible: false, Available: false, Purchased: false },
      BusinessManOutfit: { Visible: false, Available: false, Purchased: false },
      MailManOutfit: { Visible: false, Available: false, Purchased: false },
      TaxiDriverOutfit: { Visible: false, Available: false, Purchased: false },
      GrizzlyBearHeadMale: {
        Visible: false,
        Available: false,
        Purchased: false,
      },
      GrizzlyBearHeadFemale: {
        Visible: false,
        Available: false,
        Purchased: false,
      },
      BareGrizzlyBearRug: {
        Visible: false,
        Available: false,
        Purchased: false,
      },
      GrizzlyBearRug: { Visible: false, Available: false, Purchased: false },
      BareGrizzlyBearChair: {
        Visible: false,
        Available: false,
        Purchased: false,
      },
      GrizzlyBearChair: { Visible: false, Available: false, Purchased: false },
      PTouchCompanion: { Visible: false, Available: false, Purchased: false },
      PorscheCompanion: { Visible: false, Available: false, Purchased: false },
      MountedGrizzlyBearHead: {
        Visible: false,
        Available: false,
        Purchased: false,
      },
      RaddAndSonSign: { Visible: false, Available: false, Purchased: false },
    },
  },
};

export const defaultControllerData = {
  Config: {
    EnglishOverride: false,
    "1stCamInvX": false,
    "1stCamInvY": true,
    "3rdCamInvX": false,
    "3rdCamInvY": true,
    SensitivityX: 2,
    SensitivityY: 2,
  },
};

export const defaultScoresData = {
  Scores: {
    Episode01: {
      EpisodeScore: 0,
      Story: {
        Chapter01: 0,
        Chapter02: 0,
        Chapter03: 0,
        Chapter04: 0,
      },
      Mission: {
        Chapter01: 0,
        Chapter02: 0,
        Chapter03: 0,
      },
    },
    Episode_02: {
      EpisodeScore: 0,
      Story: {
        Chapter01: 0,
        Chapter02: 0,
        Chapter03: 0,
        Chapter04: 0,
      },
      Mission: {
        Chapter01: 0,
        Chapter02: 0,
        Chapter03: 0,
      },
    },
  },
};
