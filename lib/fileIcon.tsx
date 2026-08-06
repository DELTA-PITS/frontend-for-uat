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

/**
 * Simplified 8-bucket color scheme (one color per broad file category,
 * regardless of exact extension) — easier to learn/recognize at a glance
 * than one distinct hue per extension.
 */
const CATEGORY_COLOR = {
  pdf: C.red,
  document: C.blue,
  spreadsheet: C.green,
  presentation: C.orange,
  image: C.purple,
  media: C.cyan,
  archive: C.slate,
  other: C.grey,
} as const;

export const EXT_MAP: Record<string, FileIconConfig> = {
  // PDF
  pdf: { Icon: PictureAsPdfIcon, color: CATEGORY_COLOR.pdf },

  // Word-processor docs
  doc:  { Icon: ArticleIcon, color: CATEGORY_COLOR.document },
  docx: { Icon: ArticleIcon, color: CATEGORY_COLOR.document },
  odt:  { Icon: ArticleIcon, color: CATEGORY_COLOR.document },
  rtf:  { Icon: ArticleIcon, color: CATEGORY_COLOR.document },

  // Spreadsheets
  xls:  { Icon: TableChartIcon, color: CATEGORY_COLOR.spreadsheet },
  xlsx: { Icon: TableChartIcon, color: CATEGORY_COLOR.spreadsheet },
  csv:  { Icon: TableChartIcon, color: CATEGORY_COLOR.spreadsheet },
  ods:  { Icon: TableChartIcon, color: CATEGORY_COLOR.spreadsheet },

  // Presentations
  ppt:  { Icon: SlideshowIcon, color: CATEGORY_COLOR.presentation },
  pptx: { Icon: SlideshowIcon, color: CATEGORY_COLOR.presentation },
  odp:  { Icon: SlideshowIcon, color: CATEGORY_COLOR.presentation },

  // Plain text / markdown — grouped under "Lainnya"
  txt:  { Icon: TextSnippetIcon, color: CATEGORY_COLOR.other },
  md:   { Icon: TextSnippetIcon, color: CATEGORY_COLOR.other },
  log:  { Icon: TextSnippetIcon, color: CATEGORY_COLOR.other },

  // Images
  jpg:  { Icon: ImageIcon, color: CATEGORY_COLOR.image },
  jpeg: { Icon: ImageIcon, color: CATEGORY_COLOR.image },
  png:  { Icon: ImageIcon, color: CATEGORY_COLOR.image },
  gif:  { Icon: ImageIcon, color: CATEGORY_COLOR.image },
  webp: { Icon: ImageIcon, color: CATEGORY_COLOR.image },
  svg:  { Icon: ImageIcon, color: CATEGORY_COLOR.image },
  bmp:  { Icon: ImageIcon, color: CATEGORY_COLOR.image },
  tiff: { Icon: ImageIcon, color: CATEGORY_COLOR.image },
  tif:  { Icon: ImageIcon, color: CATEGORY_COLOR.image },
  heic: { Icon: ImageIcon, color: CATEGORY_COLOR.image },

  // Audio — grouped with video under "media"
  mp3:  { Icon: AudioFileIcon, color: CATEGORY_COLOR.media },
  wav:  { Icon: AudioFileIcon, color: CATEGORY_COLOR.media },
  ogg:  { Icon: AudioFileIcon, color: CATEGORY_COLOR.media },
  flac: { Icon: AudioFileIcon, color: CATEGORY_COLOR.media },
  aac:  { Icon: AudioFileIcon, color: CATEGORY_COLOR.media },
  m4a:  { Icon: AudioFileIcon, color: CATEGORY_COLOR.media },

  // Video
  mp4:  { Icon: VideoFileIcon, color: CATEGORY_COLOR.media },
  mov:  { Icon: VideoFileIcon, color: CATEGORY_COLOR.media },
  avi:  { Icon: VideoFileIcon, color: CATEGORY_COLOR.media },
  mkv:  { Icon: VideoFileIcon, color: CATEGORY_COLOR.media },
  webm: { Icon: VideoFileIcon, color: CATEGORY_COLOR.media },
  wmv:  { Icon: VideoFileIcon, color: CATEGORY_COLOR.media },

  // Archives
  zip:  { Icon: FolderZipIcon, color: CATEGORY_COLOR.archive },
  rar:  { Icon: FolderZipIcon, color: CATEGORY_COLOR.archive },
  '7z': { Icon: FolderZipIcon, color: CATEGORY_COLOR.archive },
  tar:  { Icon: FolderZipIcon, color: CATEGORY_COLOR.archive },
  gz:   { Icon: FolderZipIcon, color: CATEGORY_COLOR.archive },
  bz2:  { Icon: FolderZipIcon, color: CATEGORY_COLOR.archive },
  xz:   { Icon: FolderZipIcon, color: CATEGORY_COLOR.archive },

  // Code — grouped under "Lainnya" (not central to a document registry app)
  js:   { Icon: CodeIcon, color: CATEGORY_COLOR.other },
  jsx:  { Icon: CodeIcon, color: CATEGORY_COLOR.other },
  ts:   { Icon: CodeIcon, color: CATEGORY_COLOR.other },
  tsx:  { Icon: CodeIcon, color: CATEGORY_COLOR.other },
  py:   { Icon: CodeIcon, color: CATEGORY_COLOR.other },
  java: { Icon: CodeIcon, color: CATEGORY_COLOR.other },
  c:    { Icon: CodeIcon, color: CATEGORY_COLOR.other },
  cpp:  { Icon: CodeIcon, color: CATEGORY_COLOR.other },
  cs:   { Icon: CodeIcon, color: CATEGORY_COLOR.other },
  go:   { Icon: CodeIcon, color: CATEGORY_COLOR.other },
  rs:   { Icon: CodeIcon, color: CATEGORY_COLOR.other },
  rb:   { Icon: CodeIcon, color: CATEGORY_COLOR.other },
  php:  { Icon: CodeIcon, color: CATEGORY_COLOR.other },
  sh:   { Icon: CodeIcon, color: CATEGORY_COLOR.other },
  html: { Icon: CodeIcon, color: CATEGORY_COLOR.other },
  css:  { Icon: CodeIcon, color: CATEGORY_COLOR.other },

  // Data / config — grouped under "Lainnya"
  json: { Icon: DataObjectIcon, color: CATEGORY_COLOR.other },
  xml:  { Icon: DataObjectIcon, color: CATEGORY_COLOR.other },
  yaml: { Icon: DataObjectIcon, color: CATEGORY_COLOR.other },
  yml:  { Icon: DataObjectIcon, color: CATEGORY_COLOR.other },
  toml: { Icon: DataObjectIcon, color: CATEGORY_COLOR.other },
  env:  { Icon: DataObjectIcon, color: CATEGORY_COLOR.other },

  // Database — grouped under "Lainnya"
  sql:    { Icon: StorageIcon, color: CATEGORY_COLOR.other },
  db:     { Icon: StorageIcon, color: CATEGORY_COLOR.other },
  sqlite: { Icon: StorageIcon, color: CATEGORY_COLOR.other },
};

const FALLBACK: FileIconConfig = { Icon: InsertDriveFileIcon, color: CATEGORY_COLOR.other };

/**
 * Returns the MUI icon component and representative color for a given filename.
 * Falls back to a generic file icon for unknown extensions.
 */
export function getFileIconConfig(filename: string): FileIconConfig {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXT_MAP[ext] ?? FALLBACK;
}
