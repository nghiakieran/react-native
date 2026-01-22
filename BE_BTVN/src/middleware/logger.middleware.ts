import { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Log request
  console.log("\n" + "=".repeat(80));
  console.log(`📥 INCOMING REQUEST [${timestamp}]`);
  console.log("=".repeat(80));
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.originalUrl}`);
  console.log(`IP: ${req.ip}`);

  if (Object.keys(req.query).length > 0) {
    console.log(`Query Params:`, JSON.stringify(req.query, null, 2));
  }

  if (req.body && Object.keys(req.body).length > 0) {
    // Hide sensitive data
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) {
      sanitizedBody.password = "***HIDDEN***";
    }
    if (sanitizedBody.newPassword) {
      sanitizedBody.newPassword = "***HIDDEN***";
    }
    console.log(`Body:`, JSON.stringify(sanitizedBody, null, 2));
  }

  if (req.headers.authorization) {
    console.log(
      `Authorization: ${req.headers.authorization.substring(0, 20)}...`,
    );
  }

  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json method to log response
  res.json = function (body: any) {
    const duration = Date.now() - startTime;

    console.log("\n" + "-".repeat(80));
    console.log(`📤 OUTGOING RESPONSE`);
    console.log("-".repeat(80));
    console.log(`Status: ${res.statusCode}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Response:`, JSON.stringify(body, null, 2));
    console.log("=".repeat(80) + "\n");

    return originalJson(body);
  };

  next();
};
