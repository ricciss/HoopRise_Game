import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createPlayer, Player, Position, Ratings } from "../game/player";
import {
  train,
  rest,
  MAX_ENERGY,
  TRAIN_COST,
  REST_GAIN,
} from "../game/training";
import {
  simulateGame,
  GameResult,
  Modifiers,
  Opponent,
  GAME_COST,
} from "../game/simulation";
import {
  SEASON_WEEKS,
  isGameWeek,
  SeasonStats,
  SeasonSummary,
  emptyStats,
  addGame,
  summarize,
  applyAging,
} from "../game/season";
import {
  GameEvent,
  rollEvent,
  findEvent,
  applyEffect,
  describeEffect,
  resolveChoice,
  choiceCost,
} from "../game/events";
import {
  Injury,
  rollInjury,
  tickInjury,
  worsenInjury,
  describeInjury,
  WORSEN_CHANCE,
} from "../game/injuries";
import { Level, levelForSeason } from "../game/levels";
import { College, findCollege, generateOffers } from "../game/colleges";
import {
  Team,
  DraftResult,
  generateTeams,
  teamModifier,
  trust,
  proSeasonNumber,
  runDraft,
  pickLabel,
} from "../game/league";
import {
  Contract,
  ContractOffer,
  generateContractOffers,
  rookieSalary,
  rookieYears,
  driftTeams,
  formatMoney,
} from "../game/market";
import {
  StandingRow,
  newStandings,
  pickOpponent,
  playLeagueWeek,
  rankStandings,
} from "../game/standings";
import {
  Playoffs,
  startPlayoffs,
  advancePlayoffs,
  userMatch,
  userOpponentId,
  userResult,
  ROUND_NAMES,
} from "../game/playoffs";
import {
  CareerSummary,
  buildCareerSummary,
  canRetire,
} from "../game/legacy";
import {
  SeasonRecord,
  ContractRecord,
  ChampionRecord,
  saveGame,
  loadGame,
  clearGame,
  addSeasonRecord,
  loadHistory,
  saveTeams,
  loadTeams,
  saveDraftClass,
  saveContractRecord,
  loadContractHistory,
  saveStandings,
  saveChampion,
  loadChampions,
} from "../storage";
import { ArchivedCareer, archiveCareer, loadArchive } from "../archiveStorage";
import { COIN_SEASON, COIN_TITLE, gameCoins } from "../game/coins";
import {
  ItemId,
  findItem,
  buyBlockReason,
  findPack,
  AD_REWARD,
  ENERGY_DRINK_GAIN,
  PHYSIO_POINTS,
} from "../game/shop";
import {
  Perks,
  NO_PERKS,
  ServiceId,
  findService,
  servicePrice,
  serviceBlockReason,
  applyAgent,
  payFor,
  TRAINER_DEV,
  DOCTOR_SCALE,
} from "../game/services";
import { newlyUnlocked, overallOf } from "../game/achievements";

// Playoff opponents play as if they were this much stronger
const PLAYOFF_INTENSITY = 15;

export const LABELS: Record<keyof Ratings, string> = {
  shooting: "Shooting",
  passing: "Passing",
  defense: "Defense",
  rebounding: "Rebounding",
  speed: "Speed",
  stamina: "Stamina",
};

export interface LiveGameState {
  game: GameResult;
  shown: number; // how many quarters are revealed
}

interface GameState {
  loaded: boolean;
  player: Player | null;
  week: number;
  season: number;
  level: Level;
  energy: number;
  message: string;
  lastGame: GameResult | null;
  seasonStats: SeasonStats;
  seasonSummary: SeasonSummary | null;
  gameWeek: boolean;
  createCareer: (name: string, position: Position) => void;
  trainStat: (stat: keyof Ratings) => void;
  restWeek: () => void;
  playGame: () => void;
  nextSeason: () => void;
  newCareer: () => void;
  liveGame: LiveGameState | null;
  nextQuarter: () => void;
  skipGame: () => void;
  closeGame: () => void;
  event: GameEvent | null;
  chooseEvent: (index: number) => void;
  injury: Injury | null;
  sitOut: () => void;
  playHurt: () => void;
  college: College | null;
  offers: College[] | null;
  openOffers: () => void;
  chooseCollege: (id: string) => void;
  history: SeasonRecord[];
  teams: Team[];
  team: Team | null;
  draftPick: number | null;
  draft: DraftResult | null;
  openDraft: () => void;
  finishDraft: () => void;
  contract: Contract | null;
  earnings: number;
  coins: number;
  buyItem: (id: ItemId) => string;
  claimAdReward: () => string;
  buyPack: (id: string) => string;
  achievements: string[];
  toast: { id: number; names: string[] } | null;
  clearToast: () => void;
  perks: Perks;
  buyService: (id: ServiceId) => string;
  contractOffers: ContractOffer[] | null;
  contractHistory: ContractRecord[];
  openContractOffers: () => void;
  chooseContract: (index: number) => void;
  standings: StandingRow[];
  playoffs: Playoffs | null;
  champions: ChampionRecord[];
  playPlayoffGame: () => void;
  retired: boolean;
  careerSummary: CareerSummary | null;
  pastCareers: ArchivedCareer[];
  retire: () => void;
}

const GameContext = createContext<GameState | null>(null);

export function useGame(): GameState {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [week, setWeek] = useState(1);
  const [season, setSeason] = useState(1);
  const [energy, setEnergy] = useState(MAX_ENERGY);
  const [message, setMessage] = useState("");
  const [lastGame, setLastGame] = useState<GameResult | null>(null);
  const [seasonStats, setSeasonStats] = useState<SeasonStats>(emptyStats());
  const [seasonSummary, setSeasonSummary] = useState<SeasonSummary | null>(
    null
  );
  const [liveGame, setLiveGame] = useState<LiveGameState | null>(null);
  const [event, setEvent] = useState<GameEvent | null>(null);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [injury, setInjury] = useState<Injury | null>(null);
  const [college, setCollege] = useState<College | null>(null);
  const [offers, setOffers] = useState<College[] | null>(null);
  const [history, setHistory] = useState<SeasonRecord[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [draftPick, setDraftPick] = useState<number | null>(null);
  const [draft, setDraft] = useState<DraftResult | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [earnings, setEarnings] = useState(0);
  const [coins, setCoins] = useState(0);
  const [perks, setPerks] = useState<Perks>(NO_PERKS);
  const [achievements, setAchievements] = useState<string[]>([]);
  // The newest unlocked achievements, shown as a pop-up card for a moment
  const [toast, setToast] = useState<{ id: number; names: string[] } | null>(
    null
  );
  const [contractOffers, setContractOffers] = useState<
    ContractOffer[] | null
  >(null);
  const [contractHistory, setContractHistory] = useState<ContractRecord[]>([]);
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [playoffs, setPlayoffs] = useState<Playoffs | null>(null);
  const [champions, setChampions] = useState<ChampionRecord[]>([]);
  const [retired, setRetired] = useState(false);
  const [pastCareers, setPastCareers] = useState<ArchivedCareer[]>([]);

  // The level (high school, college, pro) depends on the season number
  const level = levelForSeason(season);
  // College perks only apply while playing at college level
  const activeCollege = level.id === "college" ? college : null;
  // Your team is looked up from the league, so it follows team changes
  const team =
    teamId !== null ? teams.find((t) => t.id === teamId) ?? null : null;

  // What changes how your team performs right now
  const mods: Modifiers | null =
    level.id === "college"
      ? activeCollege
      : level.id === "pro" && team
      ? {
          teamMod: teamModifier(team),
          minutesMod: trust(draftPick, proSeasonNumber(season)),
        }
      : null;

  // The summary of a finished career (only exists after retirement)
  const careerSummary: CareerSummary | null =
    retired && player
      ? buildCareerSummary({
          player,
          history,
          champions,
          earnings,
          draftPick,
          college: college ? college.name : null,
        })
      : null;

  // The archive of past careers belongs to the player profile
  useEffect(() => {
    loadArchive().then(setPastCareers);
  }, []);

  // Load saved game, history, league, contracts and titles on startup
  useEffect(() => {
    Promise.all([
      loadGame(),
      loadHistory(),
      loadTeams(),
      loadContractHistory(),
      loadChampions(),
    ]).then(async ([data, hist, savedTeams, contracts, titles]) => {
      if (data) {
        // Old careers without a league get one now
        let league = savedTeams;
        if (league.length === 0) {
          league = generateTeams();
          await saveTeams(league);
        }
        setTeams(league);
        setStandings(
          data.standings && data.standings.length > 0
            ? data.standings
            : newStandings(league)
        );
        setTeamId(data.teamId ?? null);
        setDraftPick(data.draftPick ?? null);
        setDraft(data.draft ?? null);
        setContract(data.contract ?? null);
        setEarnings(data.earnings ?? 0);
        setCoins(data.coins ?? 0);
        setPerks(data.perks ?? NO_PERKS);
        setAchievements(data.achievements ?? []);
        setContractOffers(data.contractOffers ?? null);
        setContractHistory(contracts);
        setPlayoffs(data.playoffs ?? null);
        setChampions(titles);
        setRetired(data.retired ?? false);

        setPlayer(data.player);
        setWeek(Math.min(data.week, SEASON_WEEKS));
        setEnergy(data.energy);
        setLastGame(data.lastGame);
        setSeason(data.season ?? 1);
        setSeasonStats(data.seasonStats ?? emptyStats());
        setSeasonSummary(data.seasonSummary ?? null);
        setEvent(data.eventId ? findEvent(data.eventId) : null);
        setInjury(data.injury ?? null);
        setCollege(data.collegeId ? findCollege(data.collegeId) : null);
        const savedOffers = (data.offerIds ?? [])
          .map(findCollege)
          .filter((c): c is College => c !== null);
        setOffers(savedOffers.length > 0 ? savedOffers : null);
        setHistory(hist);
      }
      setLoaded(true);
    });
  }, []);

  // Save after every change (only after the initial load is finished)
  useEffect(() => {
    if (!loaded) return;
    if (player) {
      saveGame({
        player,
        week,
        energy,
        lastGame,
        season,
        seasonStats,
        seasonSummary,
        eventId: event ? event.id : null,
        injury,
        collegeId: college ? college.id : null,
        offerIds: offers ? offers.map((c) => c.id) : null,
        teamId,
        draftPick,
        draft,
        contract,
        earnings,
        coins,
        perks,
        achievements,
        contractOffers,
        standings,
        playoffs,
        retired,
      });
    } else {
      clearGame();
    }
  }, [
    loaded,
    player,
    week,
    energy,
    lastGame,
    season,
    seasonStats,
    seasonSummary,
    event,
    injury,
    college,
    offers,
    teamId,
    draftPick,
    draft,
    contract,
    earnings,
    coins,
    perks,
    achievements,
    contractOffers,
    standings,
    playoffs,
    retired,
  ]);

  // Unlocks achievements whenever the data they depend on changes
  useEffect(() => {
    if (!loaded || !player) return;
    const fresh = newlyUnlocked(
      {
        lastGame,
        history,
        champions,
        overall: overallOf(player.ratings),
        earnings,
      },
      achievements
    );
    if (fresh.length === 0) return;
    const ids = fresh.map((a) => a.id);
    setAchievements((a) => [...a, ...ids.filter((id) => !a.includes(id))]);
    setToast({ id: Date.now(), names: fresh.map((a) => a.name) });
  }, [loaded, player, lastGame, history, champions, earnings]);

  function clearToast() {
    setToast(null);
  }

  // Picks the league team you play this week (pros only)
  function leagueOpponent(): Team | null {
    return level.id === "pro" && team
      ? pickOpponent(standings, teams, team.id)
      : null;
  }

  // Plays the league week and returns the new table.
  // won = null means you did not play this week.
  function updateStandings(
    opponentTeam: Team | null,
    won: boolean | null
  ): StandingRow[] {
    if (!team || !opponentTeam) return standings;
    const next = playLeagueWeek(
      standings,
      teams,
      team.id,
      opponentTeam.id,
      won
    );
    setStandings(next);
    return next;
  }

  // Remembers who won the title and how your run ended
  function recordPlayoffs(p: Playoffs) {
    const champ = teams.find((t) => t.id === p.champion);
    const record: ChampionRecord = {
      season: p.season,
      teamName: champ ? champ.name : "Unknown",
      userResult: userResult(p),
    };
    setChampions((list) => [
      ...list.filter((c) => c.season !== record.season),
      record,
    ]);
    saveChampion(record);
  }

  // Moves to the next week, or ends the season after the last week.
  // "current" is the player after this week's action (e.g. after training),
  // "table" is the league table after this week.
  function advance(
    nextStats: SeasonStats,
    current: Player | null = player,
    table: StandingRow[] = standings
  ) {
    if (!current) return;
    setSeasonStats(nextStats);
    if (week >= SEASON_WEEKS) {
      const summary = summarize(season, current.age, nextStats);
      setCoins((c) => c + COIN_SEASON);

      // Pros get paid at the end of every season, and the contract shortens
      if (level.id === "pro" && contract) {
        setEarnings((e) => e + contract.salary);
        setContract({
          ...contract,
          yearsLeft: Math.max(0, contract.yearsLeft - 1),
        });
      }

      // Keep the final league table and start the playoffs
      let playoffsActive = false;
      if (level.id === "pro" && teams.length > 0) {
        const ranked = rankStandings(table, teams);
        saveStandings(season, ranked);
        if (team) {
          const p = startPlayoffs(season, ranked, teams, team.id);
          setPlayoffs(p);
          playoffsActive = p.active;
          if (!p.active) recordPlayoffs(p);
        }
      }

      // The summary waits until your playoff run is over
      if (!playoffsActive) setSeasonSummary(summary);

      // Remember this season in the history table
      const keys = Object.keys(current.ratings) as (keyof Ratings)[];
      const overall = Math.round(
        keys.reduce((sum, k) => sum + current.ratings[k], 0) / keys.length
      );
      const record: SeasonRecord = {
        season,
        age: current.age,
        levelId: level.id,
        college: activeCollege
          ? activeCollege.name
          : level.id === "pro" && team
          ? team.name
          : null,
        games: summary.games,
        wins: summary.wins,
        losses: summary.losses,
        ppg: summary.ppg,
        rpg: summary.rpg,
        apg: summary.apg,
        overall,
      };
      setHistory((h) => [...h.filter((r) => r.season !== season), record]);
      addSeasonRecord(record);
    } else {
      const nextWeek = week + 1;
      setWeek(nextWeek);
      // Random events only happen in training weeks
      if (!isGameWeek(nextWeek)) {
        const next = rollEvent(level.id, lastEventId);
        setEvent(next);
        if (next) setLastEventId(next.id);
      }
    }
  }

  function createCareer(name: string, position: Position) {
    if (name.trim().length === 0) return;
    const league = generateTeams();
    setTeams(league);
    saveTeams(league);
    setStandings(newStandings(league));
    setTeamId(null);
    setDraftPick(null);
    setDraft(null);
    setContract(null);
    setEarnings(0);
    setCoins(0);
    setPerks(NO_PERKS);
    setAchievements([]);
    setContractOffers(null);
    setContractHistory([]);
    setPlayoffs(null);
    setChampions([]);
    setRetired(false);

    setPlayer(createPlayer(name.trim(), position));
    setWeek(1);
    setSeason(1);
    setEnergy(MAX_ENERGY);
    setMessage("");
    setLastGame(null);
    setSeasonStats(emptyStats());
    setSeasonSummary(null);
    setLiveGame(null);
    setEvent(null);
    setLastEventId(null);
    setInjury(null);
    setCollege(null);
    setOffers(null);
    setHistory([]);
  }

  function trainStat(stat: keyof Ratings) {
    if (!player || isGameWeek(week) || event) return;
    if (injury) {
      setMessage("You are injured. Rest to recover.");
      return;
    }
    if (energy < TRAIN_COST) {
      setMessage("Not enough energy. Rest first.");
      return;
    }
    const result = train(
      player,
      stat,
      energy,
      activeCollege
        ? activeCollege.development
        : perks.trainer
        ? TRAINER_DEV
        : 0
    );
    setPlayer(result.player);
    setEnergy(result.energy);
    setMessage(`${LABELS[stat]} +${result.gain}`);
    advance(seasonStats, result.player);
  }

  function restWeek() {
    if (isGameWeek(week) || event) return;
    setEnergy(rest(energy));
    if (injury) {
      const healed = tickInjury(injury, 2);
      setInjury(healed);
      setMessage(
        healed
          ? `You rested and your injury is healing. +${REST_GAIN} energy`
          : `You are healthy again! +${REST_GAIN} energy`
      );
    } else {
      setMessage(`You rested. +${REST_GAIN} energy`);
    }
    advance(seasonStats);
  }

  function playGame() {
    if (!player || !isGameWeek(week) || injury) return;
    const opponentTeam = leagueOpponent();
    const opponent: Opponent | null = opponentTeam
      ? { name: opponentTeam.name, strength: opponentTeam.strength }
      : null;
    const result = simulateGame(player, energy, level, mods, opponent);
    setLastGame(result);
    setLiveGame({ game: result, shown: 0 });

    let text = result.won ? "Victory!" : "Tough loss.";
    const hurt = rollInjury(energy, perks.doctor ? DOCTOR_SCALE : 1);
    if (hurt) {
      setInjury(hurt);
      text += ` Injury: ${describeInjury(hurt)}`;
    }

    const table = updateStandings(opponentTeam, result.won);
    setEnergy(Math.max(0, energy - GAME_COST));
    const reward = gameCoins(result.won);
    setCoins((c) => c + reward);
    setMessage(`${text} +${reward} coins`);
    advance(addGame(seasonStats, result), player, table);
  }

  // Game week while injured: skip the game and recover faster
  function sitOut() {
    if (!player || !isGameWeek(week) || !injury) return;
    const healed = tickInjury(injury, 2);
    setInjury(healed);
    setEnergy(Math.min(MAX_ENERGY, energy + 20));
    setMessage(
      healed
        ? "You sat out the game and focused on recovery. +20 energy"
        : "You sat out the game and you are healthy again! +20 energy"
    );
    // Your team still plays, the result depends on team strength
    const table = updateStandings(leagueOpponent(), null);
    advance(seasonStats, player, table);
  }

  // Game week while injured: play anyway, with a bad performance and a risk
  function playHurt() {
    if (!player || !isGameWeek(week) || !injury) return;
    const opponentTeam = leagueOpponent();
    const opponent: Opponent | null = opponentTeam
      ? { name: opponentTeam.name, strength: opponentTeam.strength }
      : null;
    const result = simulateGame(
      player,
      Math.min(energy, 20),
      level,
      mods,
      opponent
    );
    setLastGame(result);
    setLiveGame({ game: result, shown: 0 });
    setEnergy(Math.max(0, energy - GAME_COST));

    let text = result.won ? "Victory, even hurt!" : "Tough loss.";
    if (Math.random() < WORSEN_CHANCE) {
      const worse = worsenInjury(injury);
      setInjury(worse);
      text += ` You made the injury worse: ${describeInjury(worse)}`;
    } else {
      const healed = tickInjury(injury, 1);
      setInjury(healed);
      if (!healed) text += " You are healthy again!";
    }

    const table = updateStandings(opponentTeam, result.won);
    const reward = gameCoins(result.won);
    setCoins((c) => c + reward);
    setMessage(`${text} +${reward} coins`);
    advance(addGame(seasonStats, result), player, table);
  }

  // Plays your game of the current playoff round
  function playPlayoffGame() {
    if (!player || !playoffs || !playoffs.active) return;
    const opponentId = userOpponentId(playoffs);
    const opponentTeam = teams.find((t) => t.id === opponentId);
    if (!opponentTeam || !userMatch(playoffs)) return;

    // You rest between rounds, and an injury heals a little
    const startEnergy = Math.min(MAX_ENERGY, energy + REST_GAIN);
    const healed = injury ? tickInjury(injury, 2) : null;
    setInjury(healed);
    const playingHurt = healed !== null;
    const simEnergy = playingHurt ? Math.min(startEnergy, 20) : startEnergy;

    // Playoff games are harder than regular season games
    const result = simulateGame(player, simEnergy, level, mods, {
      name: opponentTeam.name,
      strength: opponentTeam.strength + PLAYOFF_INTENSITY,
    });
    setLastGame(result);
    setLiveGame({ game: result, shown: 0 });
    setEnergy(Math.max(0, startEnergy - GAME_COST));

    const roundName = ROUND_NAMES[playoffs.round];
    const next = advancePlayoffs(playoffs, teams, result.won);
    setPlayoffs(next);

    let text = result.won
      ? `${roundName}: you won! On to the next round.`
      : `${roundName}: your season ends here.`;
    if (!next.active) {
      recordPlayoffs(next);
      setSeasonSummary(summarize(season, player.age, seasonStats));
      text =
        next.champion === next.userTeamId
          ? "You are the champions!"
          : `${roundName}: your season ends here.`;
    }
    let reward = gameCoins(result.won);
    if (!next.active && next.champion === next.userTeamId) {
      reward += COIN_TITLE;
    }
    setCoins((c) => c + reward);
    setMessage(`${text} +${reward} coins`);
  }

  function chooseEvent(index: number) {
    if (!player || !event) return;
    const choice = event.choices[index];
    if (!choice) return;

    // Some choices cost money
    if (choiceCost(choice) > earnings) {
      setMessage("Not enough career earnings for that.");
      return;
    }

    const outcome = resolveChoice(choice);
    const result = applyEffect(player, energy, outcome.effect);
    setPlayer(result.player);
    setEnergy(result.energy);
    if (result.money !== 0) {
      setEarnings((e) => Math.max(0, e + result.money));
    }
    setMessage(`${outcome.text} (${describeEffect(outcome.effect)})`);
    setEvent(null);
  }

  function nextSeason() {
    if (!player) return;
    const nextLevel = levelForSeason(season + 1);
    setPlayer(applyAging(player));
    setSeason(season + 1);
    setWeek(1);
    setEnergy(MAX_ENERGY);
    setSeasonStats(emptyStats());
    setSeasonSummary(null);
    setLastGame(null);
    setLiveGame(null);
    setEvent(null);
    setInjury(null);
    setPlayoffs(null);
    setPerks((p) => ({ ...p, trainer: false, doctor: false }));

    // Teams get stronger or weaker over time, and the table starts again
    if (teams.length > 0) {
      const drifted = driftTeams(teams);
      setTeams(drifted);
      saveTeams(drifted);
      setStandings(newStandings(drifted));
    }

    setMessage(
      nextLevel.id !== level.id
        ? `Welcome to ${nextLevel.name}! The competition is tougher.`
        : "A new season begins!"
    );
  }

  // Shows the college offers after the last high school season
  function openOffers() {
    if (!player) return;
    setOffers(generateOffers(player));
  }

  function chooseCollege(id: string) {
    if (!offers) return;
    const chosen = offers.find((c) => c.id === id);
    if (!chosen) return;
    setCollege(chosen);
    setOffers(null);
    nextSeason();
    setMessage(`You signed with ${chosen.name}. Welcome to College!`);
  }

  // Runs the draft after the last college season
  function openDraft() {
    if (!player || teams.length === 0) return;
    const collegeSeasons = history.filter((r) => r.levelId === "college");
    const ppg =
      collegeSeasons.length > 0
        ? collegeSeasons.reduce((sum, r) => sum + r.ppg, 0) /
          collegeSeasons.length
        : 15;
    const result = runDraft(player, ppg, college, teams);
    setDraft(result);
    saveDraftClass(result.board);
  }

  function finishDraft() {
    if (!draft) return;
    const salary = rookieSalary(draft.userPick);
    const years = rookieYears(draft.userPick);
    const record: ContractRecord = {
      season: season + 1,
      teamName: draft.userTeamName,
      salary,
      years,
    };
    const text =
      draft.userPick !== null
        ? `Drafted: ${pickLabel(draft.userPick)} by ${draft.userTeamName}.`
        : `Undrafted, but ${draft.userTeamName} gave you a chance.`;

    setTeamId(draft.userTeamId);
    setDraftPick(draft.userPick);
    setContract({
      teamId: draft.userTeamId,
      teamName: draft.userTeamName,
      salary,
      years,
      yearsLeft: years,
    });
    setEarnings(0);
    setContractHistory([record]);
    saveContractRecord(record);
    setDraft(null);
    nextSeason();
    setMessage(
      `${text} Rookie contract: ${formatMoney(salary)} for ${years} years.`
    );
  }

  // Shows contract offers when your contract has run out
  function openContractOffers() {
    if (!player) return;
    const ppg = seasonSummary ? seasonSummary.ppg : 15;
    const offers = generateContractOffers(player, ppg, teams, teamId);
    setContractOffers(perks.agent ? applyAgent(offers) : offers);
    setPerks((p) => ({ ...p, agent: false }));
  }

  function chooseContract(index: number) {
    if (!contractOffers) return;
    const offer = contractOffers[index];
    if (!offer) return;
    const record: ContractRecord = {
      season: season + 1,
      teamName: offer.teamName,
      salary: offer.salary,
      years: offer.years,
    };
    setTeamId(offer.teamId);
    setContract({
      teamId: offer.teamId,
      teamName: offer.teamName,
      salary: offer.salary,
      years: offer.years,
      yearsLeft: offer.years,
    });
    setContractHistory((h) => [...h, record]);
    saveContractRecord(record);
    setContractOffers(null);
    nextSeason();
    setMessage(
      `Signed with ${offer.teamName}: ${formatMoney(
        offer.salary
      )} per season for ${offer.years} years.`
    );
  }

  // Ends the career and adds it to the archive of past careers
  function retire() {
    if (!player || retired || !canRetire(player.age)) return;
    const summary = buildCareerSummary({
      player,
      history,
      champions,
      earnings,
      draftPick,
      college: college ? college.name : null,
    });
    setRetired(true);
    archiveCareer(summary).then(() => loadArchive().then(setPastCareers));
  }

  // Buys a shop item with coins. Returns a message for the shop screen.
  function buyItem(id: ItemId): string {
    const item = findItem(id);
    if (!player || !item) return "";
    const reason = buyBlockReason(
      item,
      coins,
      energy,
      MAX_ENERGY,
      injury !== null
    );
    if (reason) return reason;

    if (id === "energy") {
      setEnergy(Math.min(MAX_ENERGY, energy + ENERGY_DRINK_GAIN));
    } else if (id === "physio" && injury) {
      setInjury(tickInjury(injury, PHYSIO_POINTS));
    }
    setCoins((c) => c - item.price);
    return `Bought: ${item.name}.`;
  }

  // Buys a service with career earnings. Returns a message for the shop.
  function buyService(id: ServiceId): string {
    const service = findService(id);
    if (!player || !service) return "";
    const salary = contract ? contract.salary : null;
    const reason = serviceBlockReason(service, perks, earnings, salary);
    if (reason || salary === null) return reason ?? "";

    setEarnings(payFor(earnings, servicePrice(service, salary)));
    setPerks((p) => ({ ...p, [id]: true }));
    return `Hired: ${service.name}.`;
  }

  // Called when a (test) ad has been watched to the end
  function claimAdReward(): string {
    setCoins((c) => c + AD_REWARD);
    return `Thanks for watching! +${AD_REWARD} coins.`;
  }

  // Test purchase of a coin pack (no real payment happens)
  function buyPack(id: string): string {
    const pack = findPack(id);
    if (!pack) return "";
    setCoins((c) => c + pack.coins);
    return `Test purchase complete: +${pack.coins} coins.`;
  }

  function newCareer() {
    setPlayer(null);
    setLiveGame(null);
    setEvent(null);
    setLastEventId(null);
    setInjury(null);
    setCollege(null);
    setOffers(null);
    setHistory([]);
    setTeams([]);
    setStandings([]);
    setTeamId(null);
    setDraftPick(null);
    setDraft(null);
    setContract(null);
    setEarnings(0);
    setCoins(0);
    setPerks(NO_PERKS);
    setAchievements([]);
    setContractOffers(null);
    setContractHistory([]);
    setPlayoffs(null);
    setChampions([]);
    setRetired(false);
  }

  function nextQuarter() {
    setLiveGame((l) => (l ? { ...l, shown: l.shown + 1 } : l));
  }

  function skipGame() {
    setLiveGame((l) => (l ? { ...l, shown: 4 } : l));
  }

  function closeGame() {
    setLiveGame(null);
  }

  const value: GameState = {
    loaded,
    player,
    week,
    season,
    level,
    energy,
    message,
    lastGame,
    seasonStats,
    seasonSummary,
    gameWeek: isGameWeek(week),
    createCareer,
    trainStat,
    restWeek,
    playGame,
    nextSeason,
    newCareer,
    liveGame,
    nextQuarter,
    skipGame,
    closeGame,
    event,
    chooseEvent,
    injury,
    sitOut,
    playHurt,
    college,
    offers,
    openOffers,
    chooseCollege,
    history,
    teams,
    team,
    draftPick,
    draft,
    openDraft,
    finishDraft,
    contract,
    earnings,
    coins,
    buyItem,
    claimAdReward,
    buyPack,
    achievements,
    toast,
    clearToast,
    perks,
    buyService,
    contractOffers,
    contractHistory,
    openContractOffers,
    chooseContract,
    standings,
    playoffs,
    champions,
    playPlayoffGame,
    retired,
    careerSummary,
    pastCareers,
    retire,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}