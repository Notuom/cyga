SET SCHEMA 'log515_cyga';

TRUNCATE TABLE acronym
RESTART IDENTITY;

INSERT INTO acronym (acronym, definition)
VALUES
  ('AA', 'alcooliques anonymes'),
  ('AG', 'assemblée générale'),
  ('FIQ', 'fédération des infirmières du québec'),
  ('HLM', 'habitation à loyer modique'),
  ('MTQ', 'ministère du transport du québec'),
  ('OSBL', 'organisme sans but lucratif'),
  ('RH', 'ressources humaines'),
  ('PMBOK', 'project management body of knowledge'),
  ('ITIL', 'information technology infrastructure library'),
  ('ARP', 'address resolution protocol'),
  ('FC', 'forces canadiennes'),
  ('MRC', 'municipalité régionale de comté'),
  ('QG', 'quartier général'),
  ('RENA', 'registre des entreprises non admissibles aux contrats publics'),
  ('OQLF', 'office québécois de la langue française'),
  ('HTML', 'hypertext markup language'),
  ('XML', 'extensible markup language'),
  ('TMYK', 'the more you know'),
  ('ETS', 'école de technologie supérieure'),
  ('SSBM', 'super smash brothers melee'),
  ('KISS', 'keep it simple stupid'),
  ('IDK', 'i don''t know'),
  ('MIA', 'missing in action'),
  ('FBI', 'federal bureau of investigation'),
  ('TDAH', 'trouble déficitaire de l''attention avec ou sans hyperactivité'),
  ('RIP', 'requiescat in pace'),
  ('SSL', 'secure sockets layer'),
  ('CMMI', 'capability maturity model integration');
