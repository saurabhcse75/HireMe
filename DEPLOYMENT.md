# HireMe - Deployment & Production Guidelines

## 🚀 Before Deploying

### Security Checklist

- [ ] Change JWT_SECRET in `.env` to a strong random string
- [ ] Update DB_PASSWORD to a strong password
- [ ] Set NODE_ENV to 'production'
- [ ] Update CORS_ORIGIN to actual domain
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set up proper database backups
- [ ] Review and harden database permissions
- [ ] Implement rate limiting on API
- [ ] Set up error logging and monitoring
- [ ] Review all API endpoints for injection vulnerabilities

### Performance Checklist

- [ ] Enable database query caching
- [ ] Implement pagination for list endpoints
- [ ] Compress API responses (gzip)
- [ ] Set up CDN for static assets
- [ ] Implement response caching headers
- [ ] Optimize database indexes
- [ ] Set up load balancing (if needed)
- [ ] Enable query optimization
- [ ] Set up monitoring and alerts

---

## 🔧 Production Configuration

### Backend .env (Production)

```env
# Database Configuration
DB_HOST=production-db-host.com
DB_USER=prod_user
DB_PASSWORD=<strong_random_password>
DB_NAME=hireme_production
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=<very_long_random_string_min_32_chars>
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=error
```

You can list multiple allowed origins by separating them with commas.

### Generate Secure JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

---

## 📦 Build Process

### Frontend Build

```bash
cd frontend
npm run build
```

This creates optimized production bundle in `dist/` folder.

**Output:**
- Minified JavaScript
- Optimized CSS
- Asset optimization
- Source maps (optional)

### Deploy Frontend

**Option 1: Vercel (Recommended)**
```bash
npm i -g vercel
vercel --prod
```

**Option 2: Netlify**
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

**Option 3: Traditional Server**
```bash
# Copy dist folder to server
# Configure web server (nginx/apache) to serve it
# Point to /index.html for SPA routing
```

### Frontend Environment

Create `frontend/.env` with your deployed API URL:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

### Backend Build

No build step needed, but optimize before deployment:

```bash
# Remove dev dependencies
npm ci --only=production

# Set environment to production
NODE_ENV=production
```

---

## 🗄️ Database Deployment

### Initial Setup

1. **Create Production Database**
```bash
mysql -u admin -p
CREATE DATABASE hireme_production;
USE hireme_production;
source database_schema.sql;
```

2. **Create Database User**
```sql
CREATE USER 'hireme_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON hireme_production.* TO 'hireme_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Enable Backups**
```bash
# Daily backup script
mysqldump -u hireme_user -p hireme_production > backup_$(date +%Y%m%d).sql
```

### Migration from Development

```bash
# Backup production
mysqldump -u admin -p hireme_production > production_backup.sql

# Apply schema updates
mysql -u admin -p hireme_production < updated_schema.sql

# Verify data integrity
# Run consistency checks
```

---

## 🌐 Server Hosting Options

### Node.js Backend Hosting

**Option 1: Heroku**
```bash
# Install Heroku CLI
npm install -g heroku
heroku login
heroku create your-app-name
git push heroku main
```

**Option 2: DigitalOcean**
- Create Droplet (Ubuntu 20.04 LTS)
- Install Node.js and MySQL
- Clone repository
- Configure firewall
- Set up reverse proxy (nginx)
- Enable SSL

**Option 3: AWS**
- Use EC2 for backend
- Use RDS for MySQL
- Use CloudFront for CDN
- Use Route53 for DNS
- Use Elastic Load Balancer

**Option 4: Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli
railway init
railway up
```

### Database Hosting

**Option 1: Managed MySQL Service**
- AWS RDS
- DigitalOcean Managed Databases
- Azure Database for MySQL
- Google Cloud SQL

**Option 2: Self-Hosted**
- Virtual private server (VPS)
- Dedicated server
- On-premises server

---

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Configure Nginx for HTTPS

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /var/www/hireme;
        try_files $uri /index.html;
    }
}
```

---

## 📊 Monitoring & Logging

### Set Up Error Logging

**Backend Error Logger:**
```javascript
// Add to index.js
const fs = require('fs');

app.use((err, req, res, next) => {
  const error = {
    timestamp: new Date(),
    url: req.url,
    method: req.method,
    error: err.message,
    stack: err.stack
  };

  // Log to file
  fs.appendFileSync('./logs/errors.log', JSON.stringify(error) + '\n');

  res.status(500).json({ message: 'Server error' });
});
```

### Use Monitoring Services

- **New Relic** - Performance monitoring
- **Sentry** - Error tracking
- **DataDog** - Infrastructure monitoring
- **LogRocket** - Frontend monitoring

### Set Up Alerts

```bash
# Alert when:
- Error rate > 1%
- Response time > 1 second
- Database connection fails
- API down
- Memory usage > 80%
- Disk usage > 90%
```

---

## 🚦 Load Testing

### Test Before Production

```bash
# Using Apache Bench
ab -n 1000 -c 10 https://yourdomain.com/api/health

# Using wrk (better)
wrk -t4 -c100 -d30s https://yourdomain.com/api/health

# Using Artillery
npm install -g artillery
artillery quick --count 10 --num 100 https://yourdomain.com/api/health
```

### Expected Performance Targets

- Response time: < 200ms
- Error rate: < 0.1%
- Throughput: > 1000 requests/second
- Uptime: 99.9%

---

## 📈 Scaling Strategy

### Phase 1: Single Server (0-1000 users)
- Single backend server
- Managed MySQL database
- CDN for frontend

### Phase 2: Multiple Servers (1000-10000 users)
- Multiple backend servers with load balancer
- Database replication (master-slave)
- Redis caching layer
- Separate file storage (S3)

### Phase 3: Distributed (10000+ users)
- Kubernetes orchestration
- Microservices architecture
- Database sharding
- Message queue (RabbitMQ/Kafka)
- Real-time notifications (WebSockets)

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      
      - name: Run Tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test
      
      - name: Build Frontend
        run: cd frontend && npm run build
      
      - name: Deploy Backend
        run: git push heroku main
      
      - name: Deploy Frontend
        run: |
          npm install -g vercel
          vercel --prod
```

---

## 🐛 Troubleshooting Production Issues

### Database Connection Pool Issues

```bash
# Check connection status
mysql -u user -p -e "SHOW PROCESSLIST;"

# Kill idle connections
# Increase pool size in database.js
```

### High Memory Usage

```bash
# Check memory
top
free -h

# Set Node.js memory limit
NODE_OPTIONS="--max-old-space-size=2048" node index.js
```

### Slow Queries

```sql
-- Enable query logging
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Check logs
mysql -u user -p -e "SELECT * FROM mysql.slow_log;"
```

### CORS Issues in Production

```javascript
// Update backend/.env
CORS_ORIGIN=https://yourdomain.com

// Restart backend
```

---

## 📋 Deployment Checklist

### Pre-Deployment (1 Week Before)

- [ ] Code review complete
- [ ] All tests passing
- [ ] Database backup taken
- [ ] Security audit done
- [ ] Performance tested
- [ ] Load testing completed
- [ ] Documentation updated

### Day Before Deployment

- [ ] Final backup of production database
- [ ] Deployment plan reviewed
- [ ] Rollback plan prepared
- [ ] Team notified
- [ ] Monitoring set up
- [ ] Alerts configured

### Deployment Day

- [ ] Announce maintenance window
- [ ] Scale backend servers if needed
- [ ] Deploy backend (v1)
- [ ] Verify API health
- [ ] Deploy frontend (v1)
- [ ] Test critical user flows
- [ ] Monitor error logs
- [ ] Announce deployment complete

### Post-Deployment

- [ ] Monitor for 24 hours
- [ ] Check user feedback
- [ ] Review logs for errors
- [ ] Verify all features work
- [ ] Document any issues
- [ ] Plan improvements

---

## 🔐 Security Hardening

### Database Security

```bash
# Restrict network access
# Only allow backend server IP

# Regular backups
0 2 * * * /usr/local/bin/backup_db.sh

# Monitor access
SET GLOBAL general_log = 'ON';
```

### API Security

```javascript
// Add rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);

// Add helmet for security headers
const helmet = require('helmet');
app.use(helmet());
```

### Network Security

- Configure firewall
- Use VPN for admin access
- Enable DDoS protection
- Set up WAF (Web Application Firewall)
- Regular security patches

---

## 📞 Post-Launch Support

### Monitoring Metrics

- User registration rate
- Active users
- Job applications
- API response times
- Error rates
- Database performance

### Maintenance Schedule

- Database optimization: Weekly
- Security updates: As needed
- Backup verification: Daily
- Performance monitoring: Continuous
- Code review: Per deployment

### User Support

- Set up support email
- Create FAQ page
- Monitor error reports
- Track user feedback
- Plan new features

---

## 📊 Cost Estimation (Monthly)

| Service | Cost |
|---------|------|
| Backend Server (AWS t3.small) | $10 |
| Database (AWS RDS) | $15 |
| Frontend Hosting (Vercel) | $0-20 |
| CDN (Cloudflare) | $0-50 |
| Monitoring (New Relic) | $0-15 |
| **Total** | **$25-110** |

---

## 🎯 Success Metrics

### Technical KPIs

- API uptime: > 99.9%
- Response time: < 200ms
- Error rate: < 0.1%
- Database backup success: 100%

### Business KPIs

- User registrations
- Daily active users
- Jobs posted
- Applications submitted
- User retention
- Customer satisfaction

---

## 📚 Additional Resources

- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-on-supported-toolchains/)
- [Docker for Production](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Guide](https://kubernetes.io/docs/concepts/configuration/overview/)
- [AWS Best Practices](https://docs.aws.amazon.com/wellarchitected/)
- [OWASP Security](https://owasp.org/www-project-top-ten/)

---

*Last Updated: January 2024*
*Version: 1.0.0*

---

**Ready to go to production! Follow this guide carefully for a smooth deployment.**
