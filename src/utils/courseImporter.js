import JSZip from 'jszip';

// Helper to clean folder/file names into human-readable titles
export function formatTitle(rawName) {
  if (!rawName) return 'Untitled';
  // Remove file extension
  let clean = rawName.replace(/\.[^/.]+$/, '');
  // Remove leading numbers like "01-", "01_", "1. "
  clean = clean.replace(/^(\d+[\s._-]+)/, '');
  // Replace underscores and hyphens with spaces
  clean = clean.replace(/[-_]+/g, ' ');
  // Capitalize words
  return clean
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Preserve user's exact folder/file name.
// Handles the "N.Name" format: "1.Introduction", "4.Arrays - Easy - Medium"
// Also handles "01 - Name", "01_Name", "01 Name" variants.
// Everything after the leading number+separator is kept EXACTLY as named.
function rawTitle(name) {
  if (!name) return 'Untitled';
  // Strip file extension (e.g. ".mp4", ".md")
  let clean = name.replace(/\.[^/.]+$/, '').trim();
  // Strip ONLY the leading "N." or "N - " or "N_" or "N " prefix
  // The (?=\S) lookahead ensures we only strip when real text follows
  const stripped = clean.replace(/^\d+[.\s\-_]+(?=\S)/, '').trim();
  // Fall back to the original (minus extension) if stripping wiped everything
  return stripped || clean || name;
}

// Auto-detect category from text
export function detectCategory(courseTitle, folderNames = []) {
  const combined = (courseTitle + ' ' + folderNames.join(' ')).toLowerCase();
  
  if (/python|django|flask|fastapi|pandas|numpy/.test(combined)) return 'Python & Data';
  if (/react|vue|angular|svelte|next|web|frontend|javascript|typescript|css|html/.test(combined)) return 'Web Engineering';
  if (/ai|machine learning|deep learning|neural|llm|gpt|pytorch|tensorflow/.test(combined)) return 'AI & Machine Learning';
  if (/security|cyber|pentest|ethical hack|exploit|network|crypto/.test(combined)) return 'Cybersecurity';
  if (/design|ui|ux|figma|tailwind|motion|graphic/.test(combined)) return 'UI/UX Design';
  if (/devops|docker|kubernetes|aws|cloud|ci\/cd|linux/.test(combined)) return 'Cloud & DevOps';
  if (/business|finance|management|marketing|startup/.test(combined)) return 'Business & Strategy';
  if (/mobile|flutter|react native|swift|kotlin|ios|android/.test(combined)) return 'Mobile Development';

  // Default to Title-based auto category or Imported
  return courseTitle ? `${courseTitle.split(' ')[0]} Studies` : 'Imported Courses';
}

// Select vibrant gradient based on title or random
const GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #14b8a6 0%, #84cc16 100%)'
];

export function getRandomGradient() {
  return GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
}

/**
 * Parses FileList from <input type="file" webkitdirectory directory multiple />
 */
export async function parseLocalDirectoryFiles(fileList) {
  if (!fileList || fileList.length === 0) {
    throw new Error('No files selected in directory');
  }

  const filesArray = Array.from(fileList);
  // Sort all files by their full relative path so folders & files emerge in natural order
  filesArray.sort((a, b) => {
    const pa = a.webkitRelativePath || a.name;
    const pb = b.webkitRelativePath || b.name;
    return pa.localeCompare(pb, undefined, { numeric: true, sensitivity: 'base' });
  });

  // webkitRelativePath example: "Python-Course/01-Basics/01-Intro.mp4"
  const firstPath = filesArray[0].webkitRelativePath || filesArray[0].name;
  const pathParts = firstPath.split('/');
  
  let rootCourseName = pathParts.length > 1 ? pathParts[0] : 'Imported Local Course';
  rootCourseName = formatTitle(rootCourseName);

  // Group files into modules based on subfolder
  // Map: moduleFolderName -> array of files
  const moduleMap = new Map();
  const folderNames = [];

  for (const file of filesArray) {
    const relativePath = file.webkitRelativePath || file.name;
    const parts = relativePath.split('/');

    let moduleFolderName = 'General';
    if (parts.length > 2) {
      // RootDir / ModuleFolder / LessonFile
      moduleFolderName = parts[1];
    } else if (parts.length === 2) {
      // Root-level files go under 'General'
      moduleFolderName = 'General';
    }

    if (!moduleMap.has(moduleFolderName)) {
      moduleMap.set(moduleFolderName, []);
      folderNames.push(moduleFolderName);
    }
    moduleMap.get(moduleFolderName).push(file);
  }

  const autoCategory = detectCategory(rootCourseName, folderNames);
  const courseId = 'imported_' + Date.now();

  const modules = [];
  let modIndex = 1;
  let totalXP = 0;

  // Sort module folders naturally before building modules
  const sortedFolderEntries = [...moduleMap.entries()].sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );

  for (const [folderName, files] of sortedFolderEntries) {
    // Sort files naturally by filename
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    const lessons = [];
    let lesIndex = 1;

    for (const file of files) {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      const baseTitle = rawTitle(file.name);
      const isVideo = ['.mp4', '.webm', '.ogg', '.mov', '.m4v', '.mkv'].includes(ext);
      const isText = ['.md', '.txt', '.html', '.rst'].includes(ext);
      const isQuizJson = ext === '.json' && (file.name.toLowerCase().includes('quiz') || file.name.toLowerCase().includes('test'));

      let lessonType = 'markdown';
      let contentMarkdown = '';
      let videoUrl = '';
      let quizData = null;
      let xp = 50;

      if (isVideo) {
        lessonType = 'video';
        videoUrl = URL.createObjectURL(file);
        xp = 60;
        contentMarkdown = `### ${baseTitle}\n\nLocal video file loaded: **${file.name}** (${(file.size / (1024 * 1024)).toFixed(1)} MB).\nUse the video player above to review lecture material.`;
      } else if (isQuizJson) {
        lessonType = 'quiz';
        xp = 120;
        try {
          const jsonText = await file.text();
          const parsed = JSON.parse(jsonText);
          quizData = parsed.questions ? parsed : {
            title: baseTitle + ' Assessment',
            passingScore: 70,
            questions: Array.isArray(parsed) ? parsed : [
              {
                id: 'q1',
                question: 'Confirm your understanding of ' + baseTitle,
                options: ['Understood', 'Needs review', 'Completed practice', 'Skipped'],
                correctAnswer: 0,
                explanation: 'Great job reviewing local material!'
              }
            ]
          };
        } catch {
          lessonType = 'markdown';
          contentMarkdown = await file.text();
        }
      } else if (isText) {
        lessonType = 'markdown';
        xp = 50;
        try {
          contentMarkdown = await file.text();
        } catch {
          contentMarkdown = `### ${baseTitle}\nFile: ${file.name}`;
        }
      } else {
        // Other attachments/resources
        lessonType = 'resource';
        xp = 40;
        contentMarkdown = `### Resource Attachment: ${file.name}\n\nFile size: ${(file.size / 1024).toFixed(1)} KB.\nDownload or inspect this local file in your local workspace.`;
      }

      lessons.push({
        id: `les_${courseId}_${modIndex}_${lesIndex}`,
        title: baseTitle,
        type: lessonType,
        duration: isVideo ? '15 min' : isQuizJson ? '10 min' : '8 min',
        xp,
        videoUrl,
        contentMarkdown,
        quiz: quizData,
        summary: `Local lesson from ${file.name}`
      });

      totalXP += xp;
      lesIndex++;
    }

    if (lessons.length > 0) {
      modules.push({
        id: `mod_${courseId}_${modIndex}`,
        title: rawTitle(folderName),
        description: `${lessons.length} lesson${lessons.length !== 1 ? 's' : ''} · imported from "${folderName}"`,
        lessons
      });
      modIndex++;
    }
  }

  return {
    id: courseId,
    title: rootCourseName,
    shortDescription: `Auto-generated course imported from local directory with ${modules.length} modules and ${modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons.`,
    category: autoCategory,
    level: 'All Levels',
    rating: 5.0,
    enrolledCount: 1,
    estimatedHours: `${Math.max(1, Math.round(totalXP / 100))} hrs`,
    totalXP: Math.max(300, totalXP),
    accentColor: '#3b82f6',
    gradient: getRandomGradient(),
    tags: [autoCategory, 'Local Import', 'Offline Content'],
    isImported: true,
    importedAt: new Date().toISOString(),
    modules
  };
}

/**
 * Parses a ZIP file containing course folders and files
 */
export async function parseZipCourse(file) {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  const folderMap = new Map();
  const rootName = formatTitle(file.name.replace(/\.zip$/i, ''));

  // Collect files
  const fileEntries = [];
  loadedZip.forEach((relativePath, zipEntry) => {
    if (!zipEntry.dir && !relativePath.startsWith('__MACOSX') && !relativePath.includes('.DS_Store')) {
      fileEntries.push({ relativePath, zipEntry });
    }
  });

  const folderNames = [];

  for (const { relativePath, zipEntry } of fileEntries) {
    const parts = relativePath.split('/');
    let folder = 'Overview';
    if (parts.length > 1) {
      folder = parts.length > 2 ? parts[1] : parts[0];
    }
    if (!folderMap.has(folder)) {
      folderMap.set(folder, []);
      folderNames.push(folder);
    }
    folderMap.get(folder).push({ relativePath, zipEntry });
  }

  const autoCategory = detectCategory(rootName, folderNames);
  const courseId = 'zip_' + Date.now();
  const modules = [];
  let modIndex = 1;
  let totalXP = 0;

  for (const [folderName, entries] of folderMap.entries()) {
    const lessons = [];
    let lesIndex = 1;

    for (const { relativePath, zipEntry } of entries) {
      const fileName = relativePath.split('/').pop();
      const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
      const baseTitle = rawTitle(fileName);

      let lessonType = 'markdown';
      let contentMarkdown = '';
      let videoUrl = '';
      let xp = 50;

      if (['.md', '.txt', '.html'].includes(ext)) {
        contentMarkdown = await zipEntry.async('string');
        lessonType = 'markdown';
      } else if (['.mp4', '.webm'].includes(ext)) {
        const blob = await zipEntry.async('blob');
        videoUrl = URL.createObjectURL(blob);
        lessonType = 'video';
        xp = 60;
        contentMarkdown = `### ${baseTitle}\n\nLocal video extracted from zip: **${fileName}**.`;
      } else if (ext === '.json') {
        const jsonStr = await zipEntry.async('string');
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.questions) {
            lessonType = 'quiz';
            xp = 120;
          } else {
            contentMarkdown = '```json\n' + JSON.stringify(parsed, null, 2) + '\n```';
          }
        } catch {
          contentMarkdown = jsonStr;
        }
      } else {
        contentMarkdown = `### Attached Asset: ${fileName}\nFormat: ${ext}`;
      }

      lessons.push({
        id: `les_${courseId}_${modIndex}_${lesIndex}`,
        title: baseTitle,
        type: lessonType,
        duration: '10 min',
        xp,
        videoUrl,
        contentMarkdown: contentMarkdown || `Content for ${baseTitle}`,
        summary: `Imported from archive (${fileName})`
      });

      totalXP += xp;
      lesIndex++;
    }

    if (lessons.length > 0) {
      modules.push({
        id: `mod_${courseId}_${modIndex}`,
        title: rawTitle(folderName),
        description: `${lessons.length} lesson${lessons.length !== 1 ? 's' : ''} · from "${folderName}"`,
        lessons
      });
      modIndex++;
    }
  }

  return {
    id: courseId,
    title: rootName,
    shortDescription: `Course imported from ZIP package with ${modules.length} auto-generated modules.`,
    category: autoCategory,
    level: 'Intermediate',
    rating: 5.0,
    enrolledCount: 1,
    estimatedHours: `${Math.max(1, Math.round(totalXP / 100))} hrs`,
    totalXP: Math.max(300, totalXP),
    accentColor: '#10b981',
    gradient: getRandomGradient(),
    tags: [autoCategory, 'ZIP Package', 'Offline Ready'],
    isImported: true,
    importedAt: new Date().toISOString(),
    modules
  };
}



