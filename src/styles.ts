import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#111", padding: 24, paddingTop: 70 },
  title: { color: "#ff8c00", fontSize: 34, fontWeight: "bold", marginBottom: 30 },
  label: { color: "#ccc", fontSize: 16, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: "#222", color: "#fff", padding: 14,
    borderRadius: 10, fontSize: 18,
  },
  row: { flexDirection: "row", gap: 8 },
  chip: { backgroundColor: "#222", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 },
  chipActive: { backgroundColor: "#ff8c00" },
  chipText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  button: {
    backgroundColor: "#ff8c00", padding: 16, borderRadius: 10,
    alignItems: "center", marginTop: 30,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  name: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  sub: { color: "#aaa", fontSize: 16, marginBottom: 24, marginTop: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  ratingLabel: { color: "#ccc", width: 100, fontSize: 15 },
  barBg: { flex: 1, height: 10, backgroundColor: "#222", borderRadius: 5, overflow: "hidden" },
  barFill: { height: 10, backgroundColor: "#ff8c00" },
  ratingValue: { color: "#fff", width: 36, textAlign: "right", fontSize: 15 },

    weekText: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  energyFill: { backgroundColor: "#3ddc84" },
  message: { color: "#ff8c00", fontSize: 16, marginVertical: 12, minHeight: 22 },
  trainButton: {
    backgroundColor: "#333", paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: 8, marginLeft: 8,
  },
  trainButtonDisabled: { opacity: 0.4 },
  trainButtonText: { color: "#ff8c00", fontSize: 14, fontWeight: "bold" },
  hint: { color: "#777", fontSize: 13, marginTop: 6 },
  restButton: {
    backgroundColor: "#2b7a4b", padding: 16, borderRadius: 10,
    alignItems: "center", marginTop: 20,
  },
});