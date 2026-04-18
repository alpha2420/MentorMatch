-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('student', 'mentor')),
    goals JSONB DEFAULT '[]',
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Mentors Table
CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT,
    expertise JSONB DEFAULT '[]',
    experience INTEGER,
    hourly_rate INTEGER NOT NULL,
    rating DECIMAL(2, 1) DEFAULT 0.0,
    reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    avatar TEXT,
    image TEXT,
    availability JSONB DEFAULT '[]',
    response_time TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.users(id),
    mentor_id UUID REFERENCES public.mentors(id),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    topic TEXT NOT NULL,
    duration INTEGER NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Mentors: Readable by anyone
CREATE POLICY "Public Mentors View" ON public.mentors FOR SELECT USING (true);

-- Users: Readable by authenticated persons, updateable by self
CREATE POLICY "User View" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "User Update" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Bookings: Readable and Creatable by authenticated persons related to the booking
CREATE POLICY "Booking View" ON public.bookings FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Booking Insert" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = student_id);
