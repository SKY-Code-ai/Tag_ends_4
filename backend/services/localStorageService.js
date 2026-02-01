/**
 * Local Storage Service
 * File-based JSON storage to replace MongoDB
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '../storage');

// Ensure storage directory exists
async function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

// Generic read function
async function readData(filename) {
  await ensureDir();
  const filepath = join(DATA_DIR, filename);
  try {
    if (existsSync(filepath)) {
      const data = await readFile(filepath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
  }
  return [];
}

// Generic write function
async function writeData(filename, data) {
  await ensureDir();
  const filepath = join(DATA_DIR, filename);
  await writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

// Users collection
export const Users = {
  async findOne(query) {
    const users = await readData('users.json');
    if (query.email) {
      return users.find(u => u.email === query.email);
    }
    if (query._id) {
      return users.find(u => u._id === query._id);
    }
    return null;
  },

  async findById(id) {
    const users = await readData('users.json');
    return users.find(u => u._id === id) || null;
  },

  async create(userData) {
    const users = await readData('users.json');
    const newUser = {
      _id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    await writeData('users.json', users);
    return newUser;
  }
};

// Interviews collection
export const Interviews = {
  async findById(id) {
    const interviews = await readData('interviews.json');
    return interviews.find(i => i._id === id) || null;
  },

  async findOne(query) {
    const interviews = await readData('interviews.json');
    if (query._id) {
      return interviews.find(i => i._id === query._id) || null;
    }
    return null;
  },

  async create(interviewData) {
    const interviews = await readData('interviews.json');
    const newInterview = {
      _id: uuidv4(),
      ...interviewData,
      startedAt: new Date().toISOString()
    };
    interviews.push(newInterview);
    await writeData('interviews.json', interviews);
    return newInterview;
  },

  async updateById(id, updates) {
    const interviews = await readData('interviews.json');
    const index = interviews.findIndex(i => i._id === id);
    if (index !== -1) {
      interviews[index] = { ...interviews[index], ...updates };
      await writeData('interviews.json', interviews);
      return interviews[index];
    }
    return null;
  }
};

// Responses collection
export const Responses = {
  async find(query) {
    const responses = await readData('responses.json');
    if (query.interviewId) {
      return responses.filter(r => r.interviewId === query.interviewId);
    }
    return responses;
  },

  async findOne(query) {
    const responses = await readData('responses.json');
    if (query.interviewId && query.questionId) {
      return responses.find(r => 
        r.interviewId === query.interviewId && 
        r.questionId === query.questionId
      ) || null;
    }
    return null;
  },

  async create(responseData) {
    const responses = await readData('responses.json');
    const newResponse = {
      _id: uuidv4(),
      ...responseData,
      submittedAt: new Date().toISOString()
    };
    responses.push(newResponse);
    await writeData('responses.json', responses);
    return newResponse;
  },

  async updateById(id, updates) {
    const responses = await readData('responses.json');
    const index = responses.findIndex(r => r._id === id);
    if (index !== -1) {
      responses[index] = { ...responses[index], ...updates };
      await writeData('responses.json', responses);
      return responses[index];
    }
    return null;
  }
};

// Reports collection
export const Reports = {
  async findOne(query) {
    const reports = await readData('reports.json');
    if (query.interviewId) {
      return reports.find(r => r.interviewId === query.interviewId) || null;
    }
    if (query._id) {
      return reports.find(r => r._id === query._id) || null;
    }
    return null;
  },

  async findById(id) {
    const reports = await readData('reports.json');
    return reports.find(r => r._id === id) || null;
  },

  async find(query) {
    const reports = await readData('reports.json');
    if (query.userId) {
      return reports.filter(r => r.userId === query.userId);
    }
    return reports;
  },

  async create(reportData) {
    const reports = await readData('reports.json');
    const newReport = {
      _id: uuidv4(),
      ...reportData,
      generatedAt: new Date().toISOString()
    };
    reports.push(newReport);
    await writeData('reports.json', reports);
    return newReport;
  }
};

export default {
  Users,
  Interviews,
  Responses,
  Reports
};
