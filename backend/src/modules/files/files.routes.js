import { Router } from 'express';
import fs from 'fs';
import mime from 'mime-types';
import { verifyFileSignature, resolveFilePath } from '../../services/storage.service.js';
import { sendError } from '../../utils/apiResponse.js';

const router = Router();

// Public by design (mirrors an S3/R2 presigned URL): access is controlled by
// the HMAC signature + expiry in the query string, not a session/JWT, since
// this URL is embedded directly in <img>/<video>/<audio> src attributes and
// fetched cross-process by the Python AI service.
function serveFile(req, res) {
  const key = req.params[0];
  const { expires, sig } = req.query;

  if (!verifyFileSignature({ key, expires, sig })) {
    return sendError(res, { statusCode: 403, message: 'Invalid or expired file link', code: 'INVALID_SIGNATURE' });
  }

  const filePath = resolveFilePath(key);
  if (!filePath) {
    return sendError(res, { statusCode: 404, message: 'File not found', code: 'FILE_NOT_FOUND' });
  }

  const stat = fs.statSync(filePath);
  const contentType = mime.lookup(filePath) || 'application/octet-stream';
  const range = req.headers.range;

  res.setHeader('Content-Type', contentType);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'private, max-age=3600');

  if (!range) {
    res.setHeader('Content-Length', stat.size);
    if (req.method === 'HEAD') return res.status(200).end();
    fs.createReadStream(filePath).pipe(res);
    return undefined;
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) {
    res.setHeader('Content-Range', `bytes */${stat.size}`);
    return res.status(416).end();
  }

  const start = match[1] ? Number(match[1]) : 0;
  const end = match[2] ? Number(match[2]) : stat.size - 1;

  if (start >= stat.size || end >= stat.size || start > end) {
    res.setHeader('Content-Range', `bytes */${stat.size}`);
    return res.status(416).end();
  }

  res.status(206);
  res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
  res.setHeader('Content-Length', end - start + 1);
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(filePath, { start, end }).pipe(res);
  return undefined;
}

router.get('/*', serveFile);
router.head('/*', serveFile);

export default router;
