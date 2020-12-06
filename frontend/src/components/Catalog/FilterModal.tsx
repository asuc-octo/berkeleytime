import React, { ChangeEvent, useEffect, useState } from 'react';
import without from 'lodash/without';
import { Button, Modal, Form } from 'react-bootstrap';
import { FilterParameter, PlaylistDescription } from 'utils/playlists/playlist';

type CheckboxGroupProps = {
  nestedOptions: PlaylistDescription;
  handler: (parameter: FilterParameter, isSelected: boolean) => void;
  selected: FilterParameter[];
  displayRadio: boolean;
};

const CheckboxGroup = ({
  nestedOptions,
  handler,
  selected,
  displayRadio,
}: CheckboxGroupProps) => {
  const formType = displayRadio ? 'radio' : 'checkbox';

  const isSelected = (parameter: FilterParameter): boolean =>
    !!selected.find((s) => s.value === parameter.value);

  return (
    <Form>
      {nestedOptions.map((item, index) => (
        <div key={index}>
          {'options' in item ? (
            <>
              <div className="filter-form-label">{item.label}</div>
              {Object.values(item.options).map((option) => (
                <div key={option.value}>
                  <Form.Check
                    custom
                    type={formType}
                    id={option.value}
                    name="modal-form"
                    label={option.label}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handler(option, e.target.checked)
                    }
                    checked={isSelected(option)}
                  />
                </div>
              ))}
            </>
          ) : (
            <div>
              <Form.Check
                custom
                type={formType}
                id={item.value}
                name="modal-form"
                label={item.label}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handler(item, e.target.checked)
                }
                checked={isSelected(item)}
              />
            </div>
          )}
        </div>
      ))}
    </Form>
  );
};

type Props = {
  showFilters: boolean;
  hideModal: () => void;
  options: PlaylistDescription;
  storeSelection: (values: FilterParameter[]) => void;
  defaultSelection?: FilterParameter[] | null;
  displayRadio: boolean;
};

const FilterModal = ({
  showFilters,
  hideModal,
  options,
  storeSelection,
  defaultSelection = null,
  displayRadio,
}: Props) => {
  const [currentFilters, setCurrentFilters] = useState<FilterParameter[]>([]);

  useEffect(() => {
    if (showFilters) {
      setCurrentFilters(defaultSelection || []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFilters]);

  function saveModal() {
    storeSelection(currentFilters);
    hideModal();
  }

  function updateSelectedFilters(param: FilterParameter, isSelected: boolean) {
    if (displayRadio) {
      setCurrentFilters([param]);
    } else {
      let newParams = without(currentFilters, param);
      if (isSelected) {
        newParams.push(param);
      }
      setCurrentFilters(newParams);
    }
  }

  return (
    <Modal show={showFilters} onHide={hideModal} className="bt-filter-modal">
      <div className="filter-modal">
        <div className="filter-form">
          <CheckboxGroup
            nestedOptions={options}
            handler={updateSelectedFilters}
            selected={currentFilters}
            displayRadio={displayRadio}
          />
        </div>
        <div className="filter-button-bar">
          <Button className="bt-btn-inverted" onClick={hideModal}>
            Cancel{' '}
          </Button>
          <Button className="bt-btn-primary" onClick={saveModal}>
            Save{' '}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FilterModal;
