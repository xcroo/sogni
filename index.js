import { SogniClient } from '@sogni-ai/sogni-client';
import fs from 'fs';

// Fungsi untuk membaca data dari data.txt
const readDataFile = () => {
  const data = fs.readFileSync('data.txt', 'utf-8');
  const [username, password, uuid] = data.split('|');
  return { username, password, uuid };
};

const { username, password, uuid } = readDataFile();

// Daftar style prompt
const styles = [
  'anime',
  'cyberpunk',
  'realistic',
  'pixel art',
  'watercolor painting',
  '3D render',
  'vintage illustration',
  'fantasy art',
];

// Daftar kata kunci untuk membuat prompt acak
const subjects = ['dragon', 'cyborg', 'pirate queen', 'ghostly samurai', 'dark angel', 'robot assassin', 'shaman warrior', 'time traveler', 'shadow elf', 'demon slayer'];
const actions = ['casting ancient magic', 'riding a futuristic motorcycle', 'fighting with dual swords', 'playing a mystical flute', 'hacking a security system', 'flying through the sky', 'meditating under a cherry blossom tree', 'escaping from a burning city', 'exploring ancient ruins', 'leading an army of undead'];
const environments = ['in a neon-lit cyber city', 'deep in an enchanted forest', 'on a stormy ocean', 'inside a forgotten temple', 'on a floating sky island', 'in a post-apocalyptic wasteland', 'inside a magical library', 'on a snowy mountain peak', 'in an alien spaceship', 'in a medieval battlefield'];
const moods = ['with surreal dream-like aesthetics', 'with vibrant, glowing colors', 'in a dark, eerie atmosphere', 'with hyper-realistic details', 'in a psychedelic art style', 'with soft, pastel tones', 'in a gritty noir setting', 'in a steampunk vibe', 'with cinematic lighting', 'with vintage watercolor style'];

// Fungsi untuk memilih elemen secara acak
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Fungsi untuk membangun prompt acak
const getRandomPrompt = () => {
  const subject = getRandomElement(subjects);
  const action = getRandomElement(actions);
  const environment = getRandomElement(environments);
  const mood = getRandomElement(moods);
  return `${subject} ${action} ${environment} ${mood}`;
};

// Fungsi untuk delay acak
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  try {
    const options = {
      appId: uuid,
      network: 'fast',
    };

    const client = await SogniClient.createInstance(options);
    await client.account.login(username, password);
    console.log('✅ Login berhasil!');

    const models = await client.projects.waitForModels();
    const mostPopularModel = client.projects.availableModels.reduce((a, b) =>
      a.workerCount > b.workerCount ? a : b
    );

    let i = 1;

    const generateImage = async () => {
      const randomPrompt = getRandomPrompt();
      const randomStyle = getRandomElement(styles);

      console.log(`🚀 Generating image ${i}: "${randomPrompt}" with style "${randomStyle}"`);

      const project = await client.projects.create({
        modelId: mostPopularModel.id,
        disableNSFWFilter: true,
        positivePrompt: randomPrompt,
        negativePrompt: 'malformation, bad anatomy, low quality, jpeg artifacts, watermark',
        stylePrompt: randomStyle,
        steps: 20,
        guidance: 7.5,
        numberOfImages: 1,
      });

      project.on('progress', (progress) => {
        console.log(`📊 Progres ${i}:`, progress);
      });

      const imageUrls = await project.waitForCompletion();
      console.log(`✅ Gambar ${i} selesai! URL:`, imageUrls);

      // Delay acak antara 30-60 detik
      const randomDelay = Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000; // dalam milidetik
      console.log(`⏳ Menunggu selama ${randomDelay / 1000} detik sebelum melanjutkan...`);
      await delay(randomDelay);

      i++;
      console.log(`🔄 Melanjutkan ke gambar ${i}...`);
      await generateImage(); // Panggil kembali fungsi generateImage setelah delay
    };

    await generateImage(); // Jalankan pertama kali

  } catch (error) {
    console.error('❌ Terjadi kesalahan:', error);
  }
})();
