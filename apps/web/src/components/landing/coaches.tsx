'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type Coach = {
  name: string
  role: string
  bio: string
  initials: string
  color: string
  accent: string
}

const COACHES: Coach[] = [
  {
    name: 'Zack Hirsekorn',
    role: 'Head Coach',
    initials: 'ZH',
    color: '#047499',
    accent: 'brand',
    bio: 'I have been an avid cyclist for over 25 years. I began riding in Annadel as a young kid and was forever hooked to a life on 2 wheels. I race in the MTB and gravel disciplines at the elite amateur level around California and nationally. I work professionally as a coach and personal trainer and manage operations at a local gym. I bring real race experience and a strong background in health and fitness to help student athletes build strong bodies and minds and aim to teach a love and respect for the outdoors along the way. I wish, above all, for members of the A Team to build confidence and belief in themselves and foster courage and mental strength through the amazing sport of mountain biking.',
  },
  {
    name: 'Todd Smith',
    role: 'Jr Devo Head Coach',
    initials: 'TS',
    color: '#1d4ed8',
    accent: 'blue',
    bio: 'I have been an active cyclist since I was a kid! I raced BMX and was nationally ranked in my age-group three years in a row. We "practiced" by riding the local trails at the local State Park. Once I landed in Sonoma County, my passion for trail riding and mountain biking was re-ignited riding Annadel! Although all our kids are out on their own, I got involved with the Oakland Composite team ~4 years ago as a way to contribute locally and to share my enthusiasm for the sport. My wife and I recently moved back to Santa Rosa and I quickly got engaged with the Annadel Composite team. My objective as a coach is to help get #morekidsonbikes and to create a lifelong enjoyment of mountain biking. I enjoy working with beginner and intermediate riders to help improve their trail skills and their confidence on the bike.',
  },
  {
    name: 'Maggie Swarner',
    role: 'GRiT Head Coach',
    initials: 'MS',
    color: '#db2777',
    accent: 'pink',
    bio: 'My love for outdoor adventure started early. I grew up in the mountains of Utah, with four sisters, the youngest being myself and my twin sister. On Sundays, we would hike and ski as a family. I started mountain biking in Colorado in my late teens and quickly grew passionate about "all things bike" from camping to racing. Road, dirt or cyclocross racing were all addicting and filled with supportive and enthusiastic teammates and friendships. Racing collegiately, on a women\'s team and with small local teams in Santa Cruz, built confidence and love for bikes that I never knew was in me. As a mom and a high school science teacher, I have raised my sons to be adventurous and independent in the outdoors. I look forward to working with our A Team riders to help them find joy and lifetime love for riding. Right ON! Ride ON!',
  },
  {
    name: 'Travers Ebling',
    role: 'Pathfinder Coordinator',
    initials: 'TE',
    color: '#065f46',
    accent: 'emerald',
    bio: 'Pathfinder Coordinator for the Annadel Composite team.',
  },
  {
    name: 'Steve Curtis',
    role: 'Level 3 Head Coach',
    initials: 'SC',
    color: '#7c3aed',
    accent: 'violet',
    bio: 'Cycling has been a major part of my life for as long as I can remember. I\'ve been an avid recreational mountain biker since the mid 90\'s and I\'ve enjoyed \'casual racing\' for years. Mountain biking is my \'main jam\', but I love other cycling disciplines too. I ride road and gravel, gravity and single speed, I even ride to work and the grocery store! I\'ve always loved to share my love of cycling with others and the A-Team is a great opportunity to spread this joy to families in our community. I\'ve been involved with the Annadel Composite since 2021 when my 6th grader joined the Jr. Devo Team. I love seeing the student athletes challenge themselves to improve and progress, all while having fun with friends and being active outdoors.',
  },
  {
    name: 'Eric Wildt',
    role: 'Level 3 Coach',
    initials: 'EW',
    color: '#b45309',
    accent: 'amber',
    bio: 'I\'m a mountain bike fanatic that absolutely can\'t get enough downhill and vista climbs. I joined the A-Team in 2021 when one of my riding buddies (and son!) qualified for the team as a 6th grade Jr Devo rider. We both fell in love with the camaraderie, energy, and athleticism that defines the Annadel Composite team. My personal coaching philosophy is that I truly am beyond stoked that you\'re here with us and I want to be a positive influence for you on your two-wheeled journey. I live to see people smiling on bikes, pushing themselves up a climb, finding confidence in their speed and abilities, and coming away from a group ride or race with a new friend and teammate. When I say "A" you say "TEAM!!!"',
  },
  {
    name: 'Ana Pimsler',
    role: 'Level 2 Coach',
    initials: 'AP',
    color: '#0891b2',
    accent: 'cyan',
    bio: 'I have been a coach with the A-Team for about 6 years. I have been riding mountain bikes and casually racing for about 10 years. In the last few years I have fallen in love with bikepacking, and all of the challenges and rewards it has to offer. I am a high school math teacher at Roseland Collegiate Prep, and hope to help make mountain biking accessible to any student who shows an interest in the sport. I love being a coach to new riders, and watching their faces light up when they finally ride an obstacle or clean a climb that they thought was impossible. I equally love watching the dedication of our seasoned athletes setting goals, learning how to train, and watching their hard work lead to success on the race course.',
  },
  {
    name: 'Dave Komar',
    role: 'Level 2 Coach',
    initials: 'DK',
    color: '#15803d',
    accent: 'green',
    bio: 'As a kid I was super fortunate to grow up living in Jack London State Park, having a father who worked for the park service. So instead of riding bikes around the neighborhood, I was pedaling on dirt from a young age, exploring the trails and natural beauty of Sonoma Mountain on a dusty old Schwinn. Mountain biking never left my life. Now it\'s come full circle — I get to coach my daughter and all the other A-Team rippers, and the joy I remember from mountain biking in my youth I now get to see on their faces at each group ride and race! When I\'m not on the MTB, I can usually be found trail running with our Rhodesian Ridgeback, fly-fishing, or spending time with my wife and young son (future A-Teamer!).',
  },
  {
    name: 'Jan Lau',
    role: 'Level 2 Coach',
    initials: 'JL',
    color: '#4f46e5',
    accent: 'indigo',
    bio: "I've been riding for too many years to count. I started my cycling career as a road rider and converted to a mountain bike rider when I moved to Sonoma County. I now enjoy mountain bike riding as well as gravel riding. I've been involved with the A-Team for approximately 5 years. It's been a rewarding experience working with student athletes. I'm continuously impressed by how much the student athletes improve year after year.",
  },
  {
    name: 'Kelsey Cummings',
    role: 'Level 2 Coach',
    initials: 'KC',
    color: '#be185d',
    accent: 'rose',
    bio: "I rediscovered my love of mountain biking six years ago as a way to spend more time with my children out in nature. Since then we've gone whole hog, riding gravel, road and single track as much as possible. I've been coaching for the A-Team for the last 4 years and it's a blast to support these youth athletes develop positive relationships with their own bodies and minds. There's nothing like the supportive stoke of the mountain bike community at large, and I'm happy to be part of sharing that with the next generation of cyclists.",
  },
  {
    name: 'Kenneth Clark',
    role: 'Level 2 Coach',
    initials: 'KC',
    color: '#0369a1',
    accent: 'sky',
    bio: "Originally from Scotland, I started mountain biking at 16 and joined a local MTB cycling team (Dunedin CC) at 18. I was a bike commuter for 20 years and have raced all over Scotland. Since moving to California 13 years ago, I finally ditched commuting to work in 2016 and now focus on MTB riding in Annadel. This is my third year as an A-Team coach and second as a level 2. I have two kids on the team this year, with two more excited to join as soon as they are allowed.",
  },
  {
    name: 'Thomas Dodsworth',
    role: 'Level 2 Coach',
    initials: 'TD',
    color: '#9a3412',
    accent: 'orange',
    bio: "I have been an avid mountain rambler and cyclist for 25+ years, and love sharing the stoke of pedaling with those around me. I joined the A-Team in 2021 when my eldest child began racing with the Jr Devo group. It has been an honor to work with the amazing coaches and volunteers and parents that make the A-Team happen, and most of all to work with the kids! When I'm not coaching or bikepacking I'm often at work at UCSF in the Emergency Department as a Nurse Practitioner, or chilling in the hammock with the kids reading books.",
  },
  {
    name: 'Tim Helms',
    role: 'Level 2 Coach',
    initials: 'TH',
    color: '#166534',
    accent: 'emerald',
    bio: "I grew up in Poway, located in North Inland San Diego. I started cycling early with BMX racing and riding all the trails and jump tracks around town. With two brothers, we did all the sports eventually focusing on distance running by high school. In 2000, I went on to compete for the UC Davis Aggies in both cross country and track, competing at the Collegiate Track National Championships and earning All American honors. Post-collegiately, I focused on off-road triathlon, MTB XC racing and road cycling. Since having children, the racing continues, but much less often. Coaching MTB to this age group is so rewarding and fun! The kids are sponges, and I love to watch the progress of each athlete at all skill levels. A-team!!!",
  },
]

const ROLE_ORDER = ['Head Coach', 'Jr Devo Head Coach', 'GRiT Head Coach', 'Pathfinder Coordinator', 'Level 3 Head Coach', 'Level 3 Coach', 'Level 2 Coach']

function CoachCard({ coach }: { coach: Coach }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = coach.bio.length > 200

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Top color bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: coach.color }} />

      <div className="p-6 flex flex-col flex-1">
        {/* Avatar + name */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="flex-shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform duration-300"
            style={{ backgroundColor: coach.color }}
          >
            {coach.initials}
          </div>
          <div className="pt-0.5">
            <h3 className="font-bold text-gray-900 leading-snug">{coach.name}</h3>
            <span
              className="inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold rounded-full text-white"
              style={{ backgroundColor: coach.color }}
            >
              {coach.role}
            </span>
          </div>
        </div>

        {/* Bio */}
        <div className="flex-1">
          <p className={`text-sm text-gray-500 leading-relaxed ${!expanded && isLong ? 'line-clamp-4' : ''}`}>
            {coach.bio}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="mt-2 flex items-center gap-1 text-xs font-semibold transition-colors"
              style={{ color: coach.color }}
            >
              {expanded ? 'Show less' : 'Read more'}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function CoachesSection() {
  const headCoaches = COACHES.filter(c =>
    ['Head Coach', 'Jr Devo Head Coach', 'GRiT Head Coach', 'Pathfinder Coordinator', 'Level 3 Head Coach'].includes(c.role)
  )
  const level3 = COACHES.filter(c => c.role === 'Level 3 Coach')
  const level2 = COACHES.filter(c => c.role === 'Level 2 Coach')

  return (
    <div className="space-y-12">
      {/* Head coaches */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-base font-bold text-gray-900 whitespace-nowrap">Head Coaches</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
          <span className="text-sm text-gray-400">{headCoaches.length} coaches</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {headCoaches.map(coach => <CoachCard key={coach.name} coach={coach} />)}
        </div>
      </div>

      {/* Level 3 */}
      {level3.length > 0 && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-base font-bold text-gray-900 whitespace-nowrap">Level 3 Coaches</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            <span className="text-sm text-gray-400">{level3.length} coaches</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {level3.map(coach => <CoachCard key={coach.name} coach={coach} />)}
          </div>
        </div>
      )}

      {/* Level 2 */}
      {level2.length > 0 && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-base font-bold text-gray-900 whitespace-nowrap">Level 2 Coaches</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            <span className="text-sm text-gray-400">{level2.length} coaches</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {level2.map(coach => <CoachCard key={coach.name} coach={coach} />)}
          </div>
        </div>
      )}
    </div>
  )
}
