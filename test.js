const { faker, fakerEN_IN } = require('@faker-js/faker')

const test = identifier => {
  const faker = fakerEN_IN

  const seed = parseInt(identifier.replace(/\D/g, ''), 10) || 1234
  faker.seed(seed)

  const suspicious = faker.datatype.boolean()

  const response = {
    policyNumber: identifier, // <-- as received (could be mobile or policy number),
    mobileNumber: faker.phone.number('+91-9#########'),
    policyStatus: faker.helpers.arrayElement([
      'Active',
      'Lapsed',
      'Terminated'
    ]),
    isSuspicious: suspicious,
    suspiciousNotes: suspicious
      ? faker.helpers.arrayElement([
          'Unusual high-frequency claims',
          'Recent change in nominee before claim',
          'Mismatch in hospitalization records'
        ])
      : null,
    claimsThisYear: faker.number.int({ min: 0, max: 4 }),
    lastClaim: {
      date: faker.date.recent({ days: 180 }).toISOString().split('T')[0],
      nature: faker.helpers.arrayElement([
        'Hospitalization',
        'Car Accident',
        'Mobile Theft',
        'Critical Illness',
        'Natural Disaster Damage'
      ])
    },
    sumInsured: 200000,
    amountUsed: faker.number.int({ min: 0, max: 200000 })
  }

  return response
}

const res = test('12345')
console.log(res)
