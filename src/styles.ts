import { StyleSheet } from "react-native";
import { colors, radius } from "./theme";

export const styles = StyleSheet.create({
  // ----- Layout -----
  container: {
    flexGrow: 1, backgroundColor: colors.bg,
    paddingHorizontal: 20, paddingBottom: 48, paddingTop: 60,
  },
  brandRow: { flexDirection: "row", alignItems: "center", marginBottom: 22 },
  brandDot: {
    width: 10, height: 28, borderRadius: 5,
    backgroundColor: colors.accent, marginRight: 10,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", letterSpacing: 0.5 },

  // ----- Forms -----
  label: {
    color: colors.textDim, fontSize: 13, fontWeight: "700", letterSpacing: 0.8,
    textTransform: "uppercase", marginBottom: 8, marginTop: 18,
  },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    color: colors.text, padding: 14, borderRadius: 12, fontSize: 17,
  },
  row: { flexDirection: "row", gap: 8 },
  chip: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, fontSize: 16, fontWeight: "700" },

  // ----- Buttons -----
  button: {
    backgroundColor: colors.accent, paddingVertical: 16, borderRadius: radius.button,
    alignItems: "center", marginTop: 24,
  },
  buttonText: { color: "#ffffff", fontSize: 17, fontWeight: "800" },
  restButton: {
    backgroundColor: colors.greenDark, paddingVertical: 16, borderRadius: radius.button,
    alignItems: "center", marginTop: 20,
  },
  gameButton: {
    backgroundColor: colors.blue, paddingVertical: 16, borderRadius: radius.button,
    alignItems: "center", marginTop: 20,
  },
  hurtButton: {
    backgroundColor: colors.redDark, paddingVertical: 16, borderRadius: radius.button,
    alignItems: "center", marginTop: 12,
  },
  trainButton: {
    backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginLeft: 8,
  },
  trainButtonDisabled: { opacity: 0.4 },
  trainButtonText: { color: colors.accent, fontSize: 14, fontWeight: "800" },

  // ----- Text -----
  name: { color: colors.text, fontSize: 28, fontWeight: "800" },
  sub: { color: colors.textDim, fontSize: 15, marginBottom: 22, marginTop: 4 },
  weekText: { color: colors.text, fontSize: 20, fontWeight: "800", marginBottom: 12 },
  message: { color: colors.accent, fontSize: 15, marginVertical: 12, minHeight: 22 },
  hint: { color: colors.textMute, fontSize: 13, marginTop: 6 },
  gameDay: { color: colors.blueLight, fontSize: 16, fontWeight: "800", marginBottom: 12 },
  trainDay: { color: colors.green, fontSize: 16, fontWeight: "800", marginBottom: 12 },
  highlightText: { color: colors.textDim, fontSize: 13, marginTop: 3 },

  // ----- Rating bars -----
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  ratingLabel: { color: colors.textDim, width: 100, fontSize: 14 },
  barBg: {
    flex: 1, height: 10, backgroundColor: colors.surfaceAlt,
    borderRadius: 5, overflow: "hidden",
  },
  barFill: { height: 10, backgroundColor: colors.accent, borderRadius: 5 },
  energyFill: { backgroundColor: colors.green },
  ratingValue: {
    color: colors.text, width: 36, textAlign: "right", fontSize: 15, fontWeight: "700",
  },

  // ----- Cards and statistics -----
  gameCard: {
    backgroundColor: colors.surface, borderRadius: radius.card, padding: 18,
    marginBottom: 18, borderWidth: 1, borderColor: colors.border,
  },
  gameTitle: { color: colors.textDim, fontSize: 13, fontWeight: "800", letterSpacing: 1 },
  gameScore: { color: colors.text, fontSize: 34, fontWeight: "800", marginVertical: 8 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  statBox: { alignItems: "center", flex: 1 },
  statValue: { color: colors.accent, fontSize: 24, fontWeight: "800" },
  statLabel: { color: colors.textMute, fontSize: 12, marginTop: 2, letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 5 },
  tableName: { color: colors.textDim, fontSize: 14, width: 44 },
  tableHead: { color: colors.textMute, fontSize: 12, flex: 1, textAlign: "center" },
  tableCell: { color: colors.text, fontSize: 16, fontWeight: "700", flex: 1, textAlign: "center" },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  quarterTitle: { color: colors.accent, fontSize: 14, fontWeight: "800", marginTop: 12 },

  // ----- Events -----
  eventCard: {
    backgroundColor: colors.surface, borderRadius: radius.card, padding: 18,
    borderWidth: 1, borderColor: colors.accent,
  },
  eventTag: { color: colors.accent, fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
  eventTitle: { color: colors.text, fontSize: 24, fontWeight: "800", marginTop: 6 },
  eventText: { color: colors.textDim, fontSize: 16, marginTop: 10, marginBottom: 16, lineHeight: 22 },
  choiceButton: {
    backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 14, marginTop: 10,
  },
  choiceLabel: { color: colors.text, fontSize: 17, fontWeight: "700" },
  choiceEffect: { color: colors.green, fontSize: 13, marginTop: 4 },

  // ----- Injuries -----
  injuryCard: {
    backgroundColor: colors.redSoft, borderRadius: radius.card, padding: 14,
    borderWidth: 1, borderColor: colors.red, marginTop: 12,
  },
  injuryTitle: { color: "#ff7b72", fontSize: 13, fontWeight: "800", letterSpacing: 1 },
  injuryText: { color: colors.textDim, fontSize: 14, marginTop: 4 },

  // ----- Career history -----
  historyHead: { color: colors.textMute, fontSize: 11, flex: 1, textAlign: "center" },
  historyCell: { color: colors.text, fontSize: 13, fontWeight: "700", flex: 1, textAlign: "center" },

  // ----- Draft -----
  pickRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 7, paddingHorizontal: 6, borderRadius: 8,
  },
  pickYou: { backgroundColor: colors.accentSoft },
  pickNum: { color: colors.accent, fontSize: 14, fontWeight: "800", width: 40 },
  pickName: { color: colors.text, fontSize: 14, fontWeight: "700" },
  pickMeta: { color: colors.textMute, fontSize: 12, marginTop: 2 },

  // ----- League table -----
  standRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 7, paddingHorizontal: 6, borderRadius: 8,
  },
  standRank: { color: colors.accent, fontSize: 14, fontWeight: "800", width: 30 },
  standName: { color: colors.text, fontSize: 14, flex: 1 },
  standRecord: { color: colors.textDim, fontSize: 14, fontWeight: "700", width: 56, textAlign: "right" },
  playoffLine: { borderTopWidth: 1, borderTopColor: colors.accent, marginVertical: 4, paddingTop: 2 },

  // ----- Playoffs -----
  matchTitle: { color: colors.accent, fontSize: 13, fontWeight: "800", marginTop: 14, marginBottom: 4 },
  matchRow: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, marginBottom: 4 },
  matchTeam: { color: colors.textDim, fontSize: 14, paddingVertical: 1 },
  matchWinner: { color: colors.text, fontWeight: "800" },

  // ----- Career end -----
  verdictText: { fontSize: 28, fontWeight: "800", marginVertical: 8 },
  careerRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  careerName: { color: colors.text, fontSize: 15, fontWeight: "700" },
  careerMeta: { color: colors.textMute, fontSize: 12, marginTop: 2 },
});