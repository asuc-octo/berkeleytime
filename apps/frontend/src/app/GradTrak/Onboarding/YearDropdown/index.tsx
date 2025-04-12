import React, { useState } from 'react';
import "@radix-ui/themes/styles.css";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import YearsData from './years.json';

interface YearDropdownProps {
  id: string;
  onSelectYear: (id: string, year: string) => void;
};

function YearDropdown({id, onSelectYear}: YearDropdownProps) {
  const [gradYear, setGradYear] = useState<string | null>(null);
	const { years } = YearsData;

	const handleGradSelect = (year: string) => {
		setGradYear(year);
    onSelectYear(id, year)
	  };

    return (
      <DropdownMenu.Root>
          <DropdownMenu.Trigger className='gradYearbox'>
          {gradYear ? gradYear : 'Select year'}
              {/* <ChevronDownIcon /> */}
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content className="gradOptionsBox">
                  {years.map((year) => (
                    <DropdownMenu.Item
                      key={year}
                      onSelect={() => handleGradSelect(year)}
                      className="yearOptions"
                    >
                      {year}
                    </DropdownMenu.Item>
                  ))}
              </DropdownMenu.Content>
          </DropdownMenu.Portal>
	    </DropdownMenu.Root>
    )
}

export default YearDropdown;