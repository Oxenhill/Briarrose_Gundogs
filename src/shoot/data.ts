import 'server-only'
import { one, q } from './db'
import { PERSON_COLS, type Person } from './auth'
import { todayUK, type Answer, type Team } from './util'

export type DateSummary = {
  id: string
  shoot_date: string
  cancelled: boolean
  beaters_needed: number
  pickers_needed: number
  beaters: number // people + plus-ones answering Yes, beating
  beater_children: number
  pickers: number
  picker_children: number
  maybes: number
  dogs: number
  first_aiders: number
  my_answer: Answer | null
  my_team: Team | null
  my_adults: number
  my_children: number
  my_dogs: number
  my_note: string | null
}

const SUMMARY_SQL = `
  select d.id, d.shoot_date, d.cancelled, d.beaters_needed, d.pickers_needed,
    coalesce(sum(case when a.answer='yes' and a.team='beater' then 1 + a.adults + a.children end),0)::int as beaters,
    coalesce(sum(case when a.answer='yes' and a.team='beater' then a.children end),0)::int as beater_children,
    coalesce(sum(case when a.answer='yes' and a.team='picker' then 1 + a.adults + a.children end),0)::int as pickers,
    coalesce(sum(case when a.answer='yes' and a.team='picker' then a.children end),0)::int as picker_children,
    count(*) filter (where a.answer='maybe')::int as maybes,
    coalesce(sum(case when a.answer='yes' then a.dogs end),0)::int as dogs,
    count(*) filter (where a.answer='yes' and p.first_aider and p.first_aid_expiry >= d.shoot_date)::int as first_aiders,
    max(case when a.person_id = $1 then a.answer end) as my_answer,
    max(case when a.person_id = $1 then a.team end) as my_team,
    coalesce(max(case when a.person_id = $1 then a.adults end),0)::int as my_adults,
    coalesce(max(case when a.person_id = $1 then a.children end),0)::int as my_children,
    coalesce(max(case when a.person_id = $1 then a.dogs end),0)::int as my_dogs,
    max(case when a.person_id = $1 then a.plus_note end) as my_note
  from shoot_dates d
  left join (shoot_attendance a join shoot_people p on p.id = a.person_id and p.status = 'active')
    on a.date_id = d.id
  where true
`

export async function upcomingDates(meId: string): Promise<DateSummary[]> {
  return q<DateSummary>(`${SUMMARY_SQL} and d.shoot_date >= $2 group by d.id order by d.shoot_date`, [meId, todayUK()])
}

export async function pastDates(meId: string): Promise<DateSummary[]> {
  return q<DateSummary>(`${SUMMARY_SQL} and d.shoot_date < $2 group by d.id order by d.shoot_date desc`, [meId, todayUK()])
}

export async function dateSummary(meId: string, dateId: string): Promise<DateSummary | null> {
  return one<DateSummary>(`${SUMMARY_SQL} and d.id = $2 group by d.id`, [meId, dateId])
}

export async function allDateIsos(): Promise<{ shoot_date: string; cancelled: boolean }[]> {
  return q('select shoot_date, cancelled from shoot_dates order by shoot_date')
}

export type Attendee = {
  person_id: string
  full_name: string
  mobile: string
  answer: Answer
  team: Team
  adults: number
  children: number
  plus_note: string | null
  dogs: number
  first_aider: boolean
  first_aid_expiry: string | null
  is_under_18: boolean
}

export async function attendees(dateId: string): Promise<Attendee[]> {
  return q<Attendee>(
    `select a.person_id, p.full_name, p.mobile, a.answer, a.team, a.adults, a.children, a.plus_note, a.dogs,
            p.first_aider, p.first_aid_expiry, p.is_under_18
       from shoot_attendance a join shoot_people p on p.id = a.person_id and p.status = 'active'
      where a.date_id = $1 and a.answer in ('yes','maybe')
      order by a.answer, p.full_name`,
    [dateId],
  )
}

export type AskPerson = Pick<Person, 'id' | 'full_name' | 'mobile' | 'usual_team' | 'can_do_other'> & { answer: Answer | null }

/** Active people not coming (No or no reply) who could fill the given team. */
export async function whoCanIAsk(dateId: string): Promise<AskPerson[]> {
  return q<AskPerson>(
    `select p.id, p.full_name, p.mobile, p.usual_team, p.can_do_other, a.answer
       from shoot_people p
       left join shoot_attendance a on a.person_id = p.id and a.date_id = $1
      where p.status = 'active' and p.role not in ('keeper','underkeeper') and (a.answer is null or a.answer = 'no')
      order by (a.answer is null) desc, p.full_name`,
    [dateId],
  )
}

export async function allPeople(): Promise<Person[]> {
  return q<Person>(`select ${PERSON_COLS} from shoot_people order by full_name`)
}

export async function getPerson(id: string): Promise<Person | null> {
  return one<Person>(`select ${PERSON_COLS} from shoot_people where id = $1`, [id])
}
