import { CustomContent, CustomRace, CustomClass, CustomFeat } from '../types/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Manages custom content creation, validation, and storage
 */
export class CustomContentManager {
  private storageFile = path.join(__dirname, '../data/custom-content.json');

  async loadCustomContent(): Promise<CustomContent> {
    try {
      const data = await fs.readFile(this.storageFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return { races: {}, classes: {}, feats: {} };
    }
  }

  private async saveCustomContent(content: CustomContent): Promise<void> {
    const dir = path.dirname(this.storageFile);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.storageFile, JSON.stringify(content, null, 2));
  }

  // ===== RACES =====

  async createRace(race: CustomRace): Promise<CustomRace> {
    const validation = this.validateRace(race);
    if (!validation.valid) throw new Error(validation.error);

    const content = await this.loadCustomContent();
    race.id = `custom-race-${Date.now()}`;
    race.source = 'CUSTOM';

    if (!content.races) content.races = {};
    content.races[race.name] = race;

    await this.saveCustomContent(content);
    return race;
  }

  async updateRace(name: string, updates: Partial<CustomRace>): Promise<CustomRace> {
    const content = await this.loadCustomContent();
    const race = content.races?.[name];

    if (!race) throw new Error('Race not found');
    if (race.source !== 'CUSTOM') throw new Error('Cannot edit official races');

    const updated = { ...race, ...updates } as CustomRace;
    const validation = this.validateRace(updated);
    if (!validation.valid) throw new Error(validation.error);

    content.races![name] = updated;
    await this.saveCustomContent(content);
    return updated;
  }

  async deleteRace(name: string): Promise<void> {
    const content = await this.loadCustomContent();
    const race = content.races?.[name];

    if (!race) throw new Error('Race not found');
    if (race.source !== 'CUSTOM') throw new Error('Cannot delete official races');

    delete content.races![name];
    await this.saveCustomContent(content);
  }

  async getRaces(): Promise<{ [key: string]: CustomRace }> {
    const content = await this.loadCustomContent();
    return content.races || {};
  }

  // ===== CLASSES =====

  async createClass(clazz: CustomClass): Promise<CustomClass> {
    const validation = this.validateClass(clazz);
    if (!validation.valid) throw new Error(validation.error);

    const content = await this.loadCustomContent();
    clazz.id = `custom-class-${Date.now()}`;
    clazz.source = 'CUSTOM';

    if (!content.classes) content.classes = {};
    content.classes[clazz.name] = clazz;

    await this.saveCustomContent(content);
    return clazz;
  }

  async updateClass(name: string, updates: Partial<CustomClass>): Promise<CustomClass> {
    const content = await this.loadCustomContent();
    const clazz = content.classes?.[name];

    if (!clazz) throw new Error('Class not found');
    if (clazz.source !== 'CUSTOM') throw new Error('Cannot edit official classes');

    const updated = { ...clazz, ...updates } as CustomClass;
    const validation = this.validateClass(updated);
    if (!validation.valid) throw new Error(validation.error);

    content.classes![name] = updated;
    await this.saveCustomContent(content);
    return updated;
  }

  async deleteClass(name: string): Promise<void> {
    const content = await this.loadCustomContent();
    const clazz = content.classes?.[name];

    if (!clazz) throw new Error('Class not found');
    if (clazz.source !== 'CUSTOM') throw new Error('Cannot delete official classes');

    delete content.classes![name];
    await this.saveCustomContent(content);
  }

  async getClasses(): Promise<{ [key: string]: CustomClass }> {
    const content = await this.loadCustomContent();
    return content.classes || {};
  }

  // ===== FEATS =====

  async createFeat(feat: CustomFeat): Promise<CustomFeat> {
    const validation = this.validateFeat(feat);
    if (!validation.valid) throw new Error(validation.error);

    const content = await this.loadCustomContent();
    feat.id = `custom-feat-${Date.now()}`;
    feat.source = 'CUSTOM';

    if (!content.feats) content.feats = {};
    content.feats[feat.name] = feat;

    await this.saveCustomContent(content);
    return feat;
  }

  async updateFeat(name: string, updates: Partial<CustomFeat>): Promise<CustomFeat> {
    const content = await this.loadCustomContent();
    const feat = content.feats?.[name];

    if (!feat) throw new Error('Feat not found');
    if (feat.source !== 'CUSTOM') throw new Error('Cannot edit official feats');

    const updated = { ...feat, ...updates } as CustomFeat;
    const validation = this.validateFeat(updated);
    if (!validation.valid) throw new Error(validation.error);

    content.feats![name] = updated;
    await this.saveCustomContent(content);
    return updated;
  }

  async deleteFeat(name: string): Promise<void> {
    const content = await this.loadCustomContent();
    const feat = content.feats?.[name];

    if (!feat) throw new Error('Feat not found');
    if (feat.source !== 'CUSTOM') throw new Error('Cannot delete official feats');

    delete content.feats![name];
    await this.saveCustomContent(content);
  }

  async getFeats(): Promise<{ [key: string]: CustomFeat }> {
    const content = await this.loadCustomContent();
    return content.feats || {};
  }

  // ===== VALIDATION =====

  private validateRace(race: CustomRace): { valid: boolean; error?: string } {
    if (!race.name || race.name.length < 2 || race.name.length > 50) {
      return { valid: false, error: 'Race name must be 2-50 characters' };
    }
    if (race.speed < 20 || race.speed > 40) {
      return { valid: false, error: 'Speed must be 20-40 feet' };
    }
    const totalBonus = Object.values(race.abilityBonus || {}).reduce((a, b) => a + b, 0);
    if (totalBonus > 6) {
      return { valid: false, error: 'Total ability bonuses cannot exceed +6' };
    }
    for (const [ability, bonus] of Object.entries(race.abilityBonus || {})) {
      if (bonus < -2 || bonus > 2) {
        return { valid: false, error: `${ability} bonus must be between -2 and +2` };
      }
    }
    return { valid: true };
  }

  private validateClass(clazz: CustomClass): { valid: boolean; error?: string } {
    if (!clazz.name || clazz.name.length < 2 || clazz.name.length > 50) {
      return { valid: false, error: 'Class name must be 2-50 characters' };
    }
    if (clazz.hitDice < 6 || clazz.hitDice > 12) {
      return { valid: false, error: 'Hit die must be between 6-12' };
    }
    return { valid: true };
  }

  private validateFeat(feat: CustomFeat): { valid: boolean; error?: string } {
    if (!feat.name || feat.name.length < 2 || feat.name.length > 50) {
      return { valid: false, error: 'Feat name must be 2-50 characters' };
    }
    if (!feat.description || feat.description.length < 10) {
      return { valid: false, error: 'Description must be at least 10 characters' };
    }
    return { valid: true };
  }
}

export default CustomContentManager;
