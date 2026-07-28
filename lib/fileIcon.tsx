import type { SvgIconProps } from '@mui/material';

// Documents
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import TableChartIcon from '@mui/icons-material/TableChart';
import SlideshowIcon from '@mui/icons-material/Slideshow';
// Images
import ImageIcon from '@mui/icons-material/Image';
// Audio / Video
import AudioFileIcon from '@mui/icons-material/AudioFile';
import VideoFileIcon from '@mui/icons-material/VideoFile';
// Archives
import FolderZipIcon from '@mui/icons-material/FolderZip';
// Code & data
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import StorageIcon from '@mui/icons-material/Storage';
// Fallback
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { C } from '@lib/colors';

interface FileIconConfig {
  Icon: React.ComponentType<SvgIconProps>;
  color: string;
}

export const EXT_MAP: Record<string, FileIconConfig> = {
  // PDF
  pdf: { Icon: PictureAsPdfIcon, color: C.red },

  // Word-processor docs
  doc:  { Icon: ArticleIcon, color: C.blue },
  docx: { Icon: ArticleIcon, color: C.blue },
  odt:  { Icon: ArticleIcon, color: C.blue },
  rtf:  { Icon: ArticleIcon, color: C.blue },

  // Spreadsheets
  xls:  { Icon: TableChartIcon, color: C.green },
  xlsx: { Icon: TableChartIcon, color: C.green },
  csv:  { Icon: TableChartIcon, color: C.green },
  ods:  { Icon: TableChartIcon, color: C.green },

  // Presentations
  ppt:  { Icon: SlideshowIcon, color: C.orange },
  pptx: { Icon: SlideshowIcon, color: C.orange },
  odp:  { Icon: SlideshowIcon, color: C.orange },

  // Plain text / markdown
  txt:  { Icon: TextSnippetIcon, color: C.slate },
  md:   { Icon: TextSnippetIcon, color: C.slate },
  log:  { Icon: TextSnippetIcon, color: C.slate },

  // Images
  jpg:  { Icon: ImageIcon, color: C.purple },
  jpeg: { Icon: ImageIcon, color: C.purple },
  png:  { Icon: ImageIcon, color: C.purple },
  gif:  { Icon: ImageIcon, color: C.purple },
  webp: { Icon: ImageIcon, color: C.purple },
  svg:  { Icon: ImageIcon, color: C.purple },
  bmp:  { Icon: ImageIcon, color: C.purple },
  tiff: { Icon: ImageIcon, color: C.purple },
  tif:  { Icon: ImageIcon, color: C.purple },
  heic: { Icon: ImageIcon, color: C.purple },

  // Audio
  mp3:  { Icon: AudioFileIcon, color: C.pink },
  wav:  { Icon: AudioFileIcon, color: C.pink },
  ogg:  { Icon: AudioFileIcon, color: C.pink },
  flac: { Icon: AudioFileIcon, color: C.pink },
  aac:  { Icon: AudioFileIcon, color: C.pink },
  m4a:  { Icon: AudioFileIcon, color: C.pink },

  // Video
  mp4:  { Icon: VideoFileIcon, color: C.blue },
  mov:  { Icon: VideoFileIcon, color: C.blue },
  avi:  { Icon: VideoFileIcon, color: C.blue },
  mkv:  { Icon: VideoFileIcon, color: C.blue },
  webm: { Icon: VideoFileIcon, color: C.blue },
  wmv:  { Icon: VideoFileIcon, color: C.blue },

  // Archives
  zip:  { Icon: FolderZipIcon, color: C.amber },
  rar:  { Icon: FolderZipIcon, color: C.amber },
  '7z': { Icon: FolderZipIcon, color: C.amber },
  tar:  { Icon: FolderZipIcon, color: C.amber },
  gz:   { Icon: FolderZipIcon, color: C.amber },
  bz2:  { Icon: FolderZipIcon, color: C.amber },
  xz:   { Icon: FolderZipIcon, color: C.amber },

  // Code
  js:   { Icon: CodeIcon, color: C.yellow },
  jsx:  { Icon: CodeIcon, color: C.yellow },
  ts:   { Icon: CodeIcon, color: C.blue },
  tsx:  { Icon: CodeIcon, color: C.blue },
  py:   { Icon: CodeIcon, color: C.blue },
  java: { Icon: CodeIcon, color: C.red },
  c:    { Icon: CodeIcon, color: C.slate },
  cpp:  { Icon: CodeIcon, color: C.slate },
  cs:   { Icon: CodeIcon, color: C.purple },
  go:   { Icon: CodeIcon, color: C.cyan },
  rs:   { Icon: CodeIcon, color: C.orange },
  rb:   { Icon: CodeIcon, color: C.crimson },
  php:  { Icon: CodeIcon, color: C.purple },
  sh:   { Icon: CodeIcon, color: C.green },
  html: { Icon: CodeIcon, color: C.orange },
  css:  { Icon: CodeIcon, color: C.blue },

  // Data / config
  json: { Icon: DataObjectIcon, color: C.amber },
  xml:  { Icon: DataObjectIcon, color: C.orange },
  yaml: { Icon: DataObjectIcon, color: C.slate },
  yml:  { Icon: DataObjectIcon, color: C.slate },
  toml: { Icon: DataObjectIcon, color: C.slate },
  env:  { Icon: DataObjectIcon, color: C.green },

  // Database
  sql:    { Icon: StorageIcon, color: C.teal },
  db:     { Icon: StorageIcon, color: C.teal },
  sqlite: { Icon: StorageIcon, color: C.teal },
};

const FALLBACK: FileIconConfig = { Icon: InsertDriveFileIcon, color: C.grey };

/**
 * Returns the MUI icon component and representative color for a given filename.
 * Falls back to a generic file icon for unknown extensions.
 */
export function getFileIconConfig(filename: string): FileIconConfig {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXT_MAP[ext] ?? FALLBACK;
}
