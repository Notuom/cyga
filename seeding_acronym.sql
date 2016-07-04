SET SCHEMA 'log515_cyga';

TRUNCATE TABLE acronym
RESTART IDENTITY;

INSERT INTO acronym(acronym, definition)
VALUES
  ('AA', 'alcooliques anonymes'),
  ('AG', 'assemblée générale'),
  ('FIQ', 'fédération des infirmières du québec'),
  ('HLM', 'habitation loyer modique'),
  ('MTQ', 'ministère du transport du québec'),
  ('OSBL', 'organisme sans but lucratif'),
  ('RH', 'ressources humaines'),
  ('PMBOK', 'project management book of knowledge'),
  ('ITIL', 'information technology infrastructure library'),
  ('ARP', 'address resolution protocol'),
  ('FC', 'forces canadiennes'),
  ('MRC', 'municipalité régionale de comté'),
  ('QG', 'quartier général');

COMMIT;