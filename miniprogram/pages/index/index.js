const MED_KEY = 'meds';
const SYMPTOM_KEY = 'symptoms';

function formatDateTime(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

Page({
  data: {
    medName: '',
    medDose: '',
    medTime: '',
    symptomName: '',
    symptomLevel: 5,
    symptomNote: '',
    meds: [],
    symptoms: [],
    summary: { medCount: 0, symptomCount: 0, avgLevel: '0.0' }
  },

  onLoad() {
    const meds = wx.getStorageSync(MED_KEY) || [];
    const symptoms = wx.getStorageSync(SYMPTOM_KEY) || [];
    this.setData({ meds, symptoms });
    this.updateSummary();
  },

  onMedNameInput(e) { this.setData({ medName: e.detail.value }); },
  onMedDoseInput(e) { this.setData({ medDose: e.detail.value }); },
  onMedTimeChange(e) { this.setData({ medTime: e.detail.value }); },
  onSymptomNameInput(e) { this.setData({ symptomName: e.detail.value }); },
  onSymptomNoteInput(e) { this.setData({ symptomNote: e.detail.value }); },
  onLevelChange(e) { this.setData({ symptomLevel: e.detail.value }); },

  addMed() {
    const { medName, medDose, medTime, meds } = this.data;
    if (!medName.trim() || !medDose.trim() || !medTime) {
      wx.showToast({ title: '请填写完整用药信息', icon: 'none' });
      return;
    }
    const next = meds.concat({ name: medName.trim(), dose: medDose.trim(), time: medTime });
    wx.setStorageSync(MED_KEY, next);
    this.setData({ meds: next, medName: '', medDose: '', medTime: '' });
    this.updateSummary();
  },

  removeMed(e) {
    const index = e.currentTarget.dataset.index;
    const next = this.data.meds.filter((_, i) => i !== index);
    wx.setStorageSync(MED_KEY, next);
    this.setData({ meds: next });
    this.updateSummary();
  },

  addSymptom() {
    const { symptomName, symptomLevel, symptomNote, symptoms } = this.data;
    if (!symptomName.trim()) {
      wx.showToast({ title: '请填写症状名称', icon: 'none' });
      return;
    }
    const record = {
      name: symptomName.trim(),
      level: symptomLevel,
      note: symptomNote.trim(),
      ts: formatDateTime(new Date())
    };
    const next = [record].concat(symptoms);
    wx.setStorageSync(SYMPTOM_KEY, next);
    this.setData({ symptoms: next, symptomName: '', symptomLevel: 5, symptomNote: '' });
    this.updateSummary();
  },

  updateSummary() {
    const { meds, symptoms } = this.data;
    const today = formatDateTime(new Date()).slice(0, 10);
    const todaySymptoms = symptoms.filter((s) => (s.ts || '').slice(0, 10) === today);
    const avg = todaySymptoms.length
      ? (todaySymptoms.reduce((sum, s) => sum + Number(s.level || 0), 0) / todaySymptoms.length).toFixed(1)
      : '0.0';

    this.setData({
      summary: {
        medCount: meds.length,
        symptomCount: todaySymptoms.length,
        avgLevel: avg
      }
    });
  }
});
