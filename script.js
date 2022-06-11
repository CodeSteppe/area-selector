const areaSelector = new AreaSelector({
  element: document.querySelector('#list'),
  selectableTargetSelector: '.item',
  dataSetKeyForSelection: 'id',
  onSelectionChange: (selectedIds) => {
    console.log('selectedIds', selectedIds);
  }
});