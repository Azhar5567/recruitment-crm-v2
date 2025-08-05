# RecruitCRM - Recruitment Management System

A modern, web-based Recruitment CRM tailored for recruitment consultancies and freelance recruiters. Built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

### Core Features
- **User Management**: Sign up/sign in with Supabase Auth (Email + Password, Google OAuth)
- **Candidate Management**: Add, edit, delete candidates with CV uploads and status tracking
- **Client Management**: Manage client companies and contacts with relationship status tracking
- **Job Management**: Create job listings and track application status
- **Pipeline View**: Visual drag-and-drop board for candidate pipelines
- **Activity Tracking**: Notes, emails, calls with time-stamped entries
- **Search & Filter**: Advanced search on candidates, jobs, clients
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: Zustand, React Query
- **UI Components**: Custom components with Radix UI primitives
- **Deployment**: Vercel-ready

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- npm or yarn
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd recruitment-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Go to [Supabase](https://supabase.com) and create a new project
   - Get your project URL and anon key from the project settings
   - Create the following tables in your Supabase database:

   ```sql
   -- Users table (extends Supabase auth.users)
   CREATE TABLE public.users (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     email TEXT NOT NULL,
     name TEXT NOT NULL,
     role TEXT DEFAULT 'recruiter' CHECK (role IN ('admin', 'recruiter')),
     agency_id UUID,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Candidates table
   CREATE TABLE public.candidates (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     full_name TEXT NOT NULL,
     email TEXT NOT NULL,
     phone TEXT,
     cv_url TEXT,
     status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Interviewing', 'Offered', 'Hired', 'Rejected')),
     tags TEXT[] DEFAULT '{}',
     notes TEXT[] DEFAULT '{}',
     created_by UUID REFERENCES public.users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Clients table
   CREATE TABLE public.clients (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     industry TEXT,
     contacts JSONB DEFAULT '{}',
     status TEXT DEFAULT 'Cold' CHECK (status IN ('Cold', 'Warm', 'Active', 'Closed')),
     notes TEXT[] DEFAULT '{}',
     created_by UUID REFERENCES public.users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Jobs table
   CREATE TABLE public.jobs (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     client_id UUID REFERENCES public.clients(id),
     description TEXT,
     status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Interviewing', 'Closed')),
     created_by UUID REFERENCES public.users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Job Applications table
   CREATE TABLE public.job_applications (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     candidate_id UUID REFERENCES public.candidates(id),
     job_id UUID REFERENCES public.jobs(id),
     status TEXT DEFAULT 'Contacted' CHECK (status IN ('Contacted', 'Interview', 'Offer', 'Hired', 'Rejected')),
     stage_order INTEGER DEFAULT 0,
     notes TEXT[] DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Activities table
   CREATE TABLE public.activities (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     type TEXT NOT NULL CHECK (type IN ('note', 'email', 'call')),
     content TEXT NOT NULL,
     target_type TEXT NOT NULL CHECK (target_type IN ('candidate', 'client', 'job')),
     target_id UUID NOT NULL,
     created_by UUID REFERENCES public.users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

4. **Set up Row Level Security (RLS)**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

   -- Create policies (basic example - customize as needed)
   CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can insert own data" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
   CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

   -- Similar policies for other tables...
   ```

5. **Create environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
recruitment-crm/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── candidates/        # Candidates management
│   ├── clients/          # Clients management
│   ├── jobs/             # Jobs management
│   ├── settings/         # User settings
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── store.ts          # Zustand stores
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Technologies Used
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Supabase**: Backend-as-a-Service
- **Zustand**: Lightweight state management
- **React Query**: Server state management
- **Lucide React**: Icon library

## 🚀 Deployment

### Quick Deploy to Vercel
1. **Push to GitHub**: Follow the steps in [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Connect to Vercel**: Import your GitHub repository
3. **Configure Environment Variables**: Add your Supabase credentials
4. **Deploy**: Vercel will automatically build and deploy your app

### Detailed Deployment Guide
For a complete step-by-step guide with troubleshooting, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔐 Security Features

- Row Level Security (RLS) policies in Supabase
- User authentication with Supabase Auth
- Protected routes and middleware
- Input validation and sanitization
- Secure file uploads to Supabase Storage

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎯 Roadmap

### Phase 2 Features
- [ ] Advanced reporting and analytics
- [ ] Email integration
- [ ] Task management and reminders
- [ ] Advanced search and filtering
- [ ] Bulk operations
- [ ] Data import/export
- [ ] API integrations (LinkedIn, etc.)
- [ ] Mobile app

### Phase 3 Features
- [ ] AI-powered resume parsing
- [ ] Automated email campaigns
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant support
- [ ] Advanced workflow automation

---

**Built with ❤️ using Next.js, TypeScript, and Supabase**
